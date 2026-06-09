import os
import re
import json
import requests
from bs4 import BeautifulSoup
import time
import datetime

def load_local_members():
    """로컬 폴더의 data/members.json 파일을 읽어옵니다."""
    try:
        with open("data/members.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("members", [])
    except FileNotFoundError:
        print("[경고] 'data/members.json' 파일이 존재하지 않습니다. 멤버 매핑을 건너뜁니다.")
        return []
    except Exception as e:
        print(f"[오류] members.json 로드 실패: {e}")
        return []

def is_valid_member_name(token):
    """
    본문 파싱 토큰 중 메타 데이터나 불필요한 단어를 배제하고 
    순수 이름 형태의 토큰만 거르는 헬퍼 함수입니다.
    """
    token = token.strip()
    if not token:
        return False
    # 블랙리스트 키워드 필터링
    blacklist = ["出演", "멤버", "メンバー", "変更", "休演", "公演", "予定", "一覧", "詳細", "チケット", "受付"]
    if any(word in token for word in blacklist):
        return False
    # 특수기호나 대괄호 배제
    if any(char in token for char in ["【", "】", "[", "]", "：", ":", "■", "※"]):
        return False
    # SKE48 이름 길이는 대개 공백 제외 2글자에서 8글자 사이입니다.
    if len(token) < 2 or len(token) > 8:
        return False
    return True

def clean_and_match_members(text, members_list):
    """
    본문 텍스트를 기호 기준으로 쪼개어 매칭합니다.
    [해결] 멤버 이름에 붙은 접두사(멤버:, メンバー：, ※ 등)를 먼저 정교하게 잘라냅니다.
    """
    if not text:
        return []
        
    # 가운뎃점(・), 일본식 쉼표(、), 쉼표(,), 슬래시(/), 줄바꿈 기준으로 토큰 분리
    raw_tokens = re.split(r"[・、，,/\n\r]+", text)
    matched_ids = []
    
    # members.json 매핑용 사전 생성
    member_map = {}
    for member in members_list:
        member_name = member.get("name", "")
        member_id = member.get("memberId", "")
        if member_name:
            cleaned_m_name = re.sub(r"\s+", "", member_name)
            member_map[cleaned_m_name] = member_id
            
    for token in raw_tokens:
        token = token.strip()
        
        # ==========================================
        # 💡 [신규 전처리 추가] 이름에 붙은 메타 접두사를 순차 제거 [1]
        # ==========================================
        # 1단계: 대괄호 헤더 제거 (예: 【出演メンバー】멤버명 -> 멤버명)
        token = re.sub(r"^【[^】]+】", "", token).strip()
        
        # 2단계: 멤버/출연 키워드, 콜론, 가운뎃점, 특수 기호 제거 (예: メンバー：멤버명 -> 멤버명)
        # 한국어 표기(멤버:, 출연:)와 일본어 표기(メンバー：, 出演：) 모두 대응합니다.
        token = re.sub(r"^(?:멤버|출연멤버|出演멤버|出演メンバー|メンバー|出演|※|・)[:：\s・]*", "", token).strip()
        
        # 필터링 통과 여부 검사 (이름 정제 후에 검사해야 "멤버" 블랙리스트에 걸리지 않습니다)
        if not is_valid_member_name(token):
            continue
            
        # 매치용 임시 무공백 텍스트
        cleaned_token = re.sub(r"\s+", "", token)
        
        if cleaned_token in member_map:
            # 1. members.json에 매칭되는 멤버는 ID로 수집
            m_id = member_map[cleaned_token]
            if m_id not in matched_ids:
                matched_ids.append(m_id)
        else:
            # 2. 매칭되는 멤버가 없는 경우 본래 이름 문자열 그대로 보존
            if token not in matched_ids:
                matched_ids.append(token)
                
    return matched_ids
    
def normalize_date(date_text):
    date_text = date_text.strip()
    match = re.search(r"(\d{4})[\./](\d{1,2})[\./](\d{1,2})", date_text)
    if match:
        year, month, day = match.groups()
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"
    return date_text

def extract_performance_time(text):
    match = re.search(r"(\d{2}:\d{2})", text)
    if match:
        return match.group(1)
    return "00:00"

def extract_venue(text):
    match = re.search(r"会場[／:：\s]+([^\n\r\|]+)", text)
    if match:
        return match.group(1).strip()
    if "劇場" in text or "公演" in text:
        return "SKE48劇場"
    return "외부 행사장"

def parse_schedule_detail(url, session, members_list):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = session.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"   [오류] 상세 페이지 로드 실패 ({url}): {e}")
        return None
        
    soup = BeautifulSoup(response.text, "html.parser")
    title_tag = soup.select_one("div.wrap--main p.tit")
    title = title_tag.get_text(strip=True) if title_tag else "알 수 없는 공연"
    
    date_tag = soup.select_one("div.wrap--main time.date.date--event")
    raw_date = date_tag.get_text(strip=True) if date_tag else ""
    date_formatted = normalize_date(raw_date) if raw_date else ""
    
    mso_elements = soup.select("div.wrap--main div.txt p.MsoNormal")
    if not mso_elements:
        mso_elements = soup.select("div.wrap--main div.txt p")
        
    first_p_text = ""
    second_p_text = ""
    
    if len(mso_elements) >= 1:
        first_p_text = mso_elements[0].get_text(separator=" ", strip=True)
    if len(mso_elements) >= 2:
        second_p_text = mso_elements[1].get_text(separator=" ", strip=True)
        
    time_str = extract_performance_time(first_p_text)
    venue_str = extract_venue(first_p_text)
    cast_ids = clean_and_match_members(second_p_text, members_list)
    
    if not cast_ids and len(mso_elements) > 0:
        full_text_area = soup.select_one("div.wrap--main div.txt")
        if full_text_area:
            cast_ids = clean_and_match_members(full_text_area.get_text(), members_list)
            
    return {
        "title": title,
        "link": url,
        "date": date_formatted,
        "time": time_str,
        "venue": venue_str,
        "status": "SCHEDULED",
        "castIds": cast_ids
    }

def scrape_monthly_schedules(year, month, members_list):
    clean_month = str(int(month))
    list_url = f"https://ske48.co.jp/schedule/list/{year}/{clean_month}/"
    
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    
    try:
        print(f"\n[{year}년 {month}월] 스케줄 수집 시작")
        response = session.get(list_url, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"목록 페이지 요청 에러: {e}")
        return
        
    soup = BeautifulSoup(response.text, "html.parser")
    schedule_links = soup.select("div.live02 > a")
    
    detail_urls = []
    for a_tag in schedule_links:
        href = a_tag.get("href")
        if not href:
            continue
        if href.startswith("/"):
            href = "https://ske48.co.jp" + href
        if href not in detail_urls:
            detail_urls.append(href)
            
    total_schedules = len(detail_urls)
    print(f"총 {total_schedules}개의 스케줄 발견")
    
    performances = []
    year_short = str(year)[-2:]
    month_formatted = f"{int(month):02d}"
    id_prefix = f"P{year_short}{month_formatted}"
    
    for idx, detail_url in enumerate(detail_urls, 1):
        performance_id = f"{id_prefix}_{idx:02d}"
        perf_data = parse_schedule_detail(detail_url, session, members_list)
        if perf_data:
            perf_data = {"performanceId": performance_id, **perf_data}
            performances.append(perf_data)
        time.sleep(0.5)
        
    output_data = {
        "yearMonth": f"{int(year):04d}-{int(month):02d}",
        "performances": performances
    }
    
    os.makedirs("data", exist_ok=True)
    file_name = f"data/performances_{year}_{int(month):02d}.json"
    
    with open(file_name, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    print(f"-> 저장 완료: {file_name} ({len(performances)}건)")

if __name__ == "__main__":
    today = datetime.date.today()
    
    current_year = today.year
    current_month = today.month
    
    first_day_of_current_month = today.replace(day=1)
    next_month_date = first_day_of_current_month + datetime.timedelta(days=32)
    next_year = next_month_date.year
    next_month = next_month_date.month
    
    members_list = load_local_members()
    
    scrape_monthly_schedules(current_year, current_month, members_list)
    scrape_monthly_schedules(next_year, next_month, members_list)