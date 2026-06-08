import os
import re
import json
import requests
from bs4 import BeautifulSoup
import time
import datetime # 연월 자동 연산을 위해 임포트

def load_local_members():
    """로컬 폴더의 data/members.json 파일을 읽어옵니다."""
    try:
        # 웹서버 경로에 대응하도록 data/members.json을 읽습니다.
        with open("data/members.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("members", [])
    except FileNotFoundError:
        print("[경고] 'data/members.json' 파일이 존재하지 않습니다. 멤버 매핑을 건너뜁니다.")
        return []
    except Exception as e:
        print(f"[오류] members.json 로드 실패: {e}")
        return []

def clean_and_match_members(text, members_list):
    if not text:
        return []
    cleaned_target_text = re.sub(r"\s+", "", text)
    matched_ids = []
    
    for member in members_list:
        member_name = member.get("name", "")
        member_id = member.get("memberId", "")
        if member_name:
            cleaned_member_name = re.sub(r"\s+", "", member_name)
            if cleaned_member_name and cleaned_member_name in cleaned_target_text:
                if member_id not in matched_ids:
                    matched_ids.append(member_id)
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
    
    # 웹앱 호출 경로 규격에 맞춰 data/ 폴더 내부에 안전하게 생성합니다.
    os.makedirs("data", exist_ok=True)
    file_name = f"data/performances_{year}_{int(month):02d}.json"
    
    with open(file_name, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    print(f"-> 저장 완료: {file_name} ({len(performances)}건)")

if __name__ == "__main__":
    # 라이브 시간 연산을 사용하여 '이번 달'과 '다음 달'을 실시간으로 추적합니다 [1].
    today = datetime.date.today()
    
    # 1. 이번 달 (Current Month)
    current_year = today.year
    current_month = today.month
    
    # 2. 다음 달 (Next Month - 월이 12월일 경우 연도를 안전하게 밀어내기 처리)
    first_day_of_current_month = today.replace(day=1)
    next_month_date = first_day_of_current_month + datetime.timedelta(days=32)
    next_year = next_month_date.year
    next_month = next_month_date.month
    
    # 공통 멤버 사전 1회 일괄 로드
    members_list = load_local_members()
    
    # 이번 달과 다음 달의 전체 일정 스캔
    scrape_monthly_schedules(current_year, current_month, members_list)
    scrape_monthly_schedules(next_year, next_month, members_list)