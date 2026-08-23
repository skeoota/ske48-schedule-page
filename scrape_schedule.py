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
    [live02용] 본문 텍스트를 기호 기준으로 쪼개어 매칭합니다.
    """
    if not text:
        return []
        
    # 가운뎃점(・), 일본식 쉼표(、), 쉼표(,), 슬래시(/), 전각 슬래시(／), 줄바꿈 기준으로 토큰 분리
    raw_tokens = re.split(r"[・、，,/\n\r／]+", text)
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
        
        # 1단계: 대괄호 헤더 제거 (예: 【出演メンバー】멤버명 -> 멤버명)
        token = re.sub(r"^【[^】]+】", "", token).strip()
        
        # 2단계: 멤버/출연 키워드 및 앞에 붙은 특수기호(■, ※ 등), 그리고 콜론, 슬래시 정밀 제거
        token = re.sub(r"^[■※●★◆▲▼]*?(?:멤버|출연멤버|出演멤버|出演멤버|出演メンバー|メンバー|出演|※|・)[:：\s・／/]*", "", token).strip()
        
        # 필터링 통과 여부 검사 (이름 정제 후에 검사해야 "멤버"나 "출연" 블랙리스트에 걸리지 않습니다)
        if not is_valid_member_name(token):
            continue
            
        # 매치용 임시 무공백 텍스트
        cleaned_token = re.sub(r"\s+", "", token)
        
        if cleaned_token in member_map:
            # members.json에 매칭되는 멤버는 ID로 수집
            m_id = member_map[cleaned_token]
            if m_id not in matched_ids:
                matched_ids.append(m_id)
        else:
            # 매칭되는 멤버가 없는 경우 본래 이름 문자열 그대로 보존
            if token not in matched_ids:
                matched_ids.append(token)
                
    return matched_ids

def parse_tags_members(soup, members_list):
    """
    [live04, live06용] 상세페이지 내 해시태그 영역에서 
    #로 시작하는 멤버들을 찾아 #를 제외하고 매칭합니다.
    """
    cast_ids = []
    span_tags = soup.select("div.tag_list ul li a span")
    
    # members.json 매핑용 사전 생성
    member_map = {}
    for member in members_list:
        member_name = member.get("name", "")
        member_id = member.get("memberId", "")
        if member_name:
            cleaned_m_name = re.sub(r"\s+", "", member_name)
            member_map[cleaned_m_name] = member_id
            
    for span in span_tags:
        text = span.get_text(strip=True)
        # '#'으로 시작하는 멤버를 출연진 데이터에 '#'를 제외하고 파싱
        if text.startswith("#"):
            text = text[1:].strip()
            
        cleaned_token = re.sub(r"\s+", "", text)
        
        if cleaned_token in member_map:
            m_id = member_map[cleaned_token]
            if m_id not in cast_ids:
                cast_ids.append(m_id)
        else:
            # 매칭되지 않아도 이름 형태를 보존하여 격자 대응을 돕습니다.
            if text and text not in cast_ids:
                cast_ids.append(text)
                
    return cast_ids

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
    return ""

def extract_venue(text, full_text=None):
    search_text = full_text if full_text is not None else text
    
    # Split into lines and strip
    lines = [line.strip() for line in search_text.splitlines() if line.strip()]
    
    venue_keywords = ["会場", "場所", "実施店舗"]
    stop_keywords = [
        "■", "※", "出演", "メンバー", "チケット", "日程", "日時", "時間", 
        "開場", "開演", "詳細", "公式", "http", "店舗サイト", "公演", 
        "特典", "販売", "対象", "予約", "受付", "集合", "開始", "終了", "料金"
    ]
    
    found_idx = -1
    prefix_to_remove = ""
    
    for i, line in enumerate(lines):
        for kw in venue_keywords:
            pattern = rf"{kw}[／:：\s]+"
            match = re.search(pattern, line)
            if match:
                found_idx = i
                prefix_to_remove = match.group(0)
                break
        if found_idx != -1:
            break
            
    if found_idx != -1:
        venue_parts = []
        
        # Get the remaining part of the line where keyword was found
        parts = lines[found_idx].split(prefix_to_remove, 1)
        first_line_part = parts[-1].strip() if len(parts) > 1 else ""
        first_line_part = re.sub(r"^[■※●★◆▲▼\s]+", "", first_line_part)
        
        if first_line_part:
            if not any(skw in first_line_part for skw in stop_keywords) and not first_line_part.startswith("【"):
                # Apply time indicator check
                if not (re.search(r"\d", first_line_part) and any(t_kw in first_line_part for t_kw in ["時", "分", "部", ":", "："])):
                    venue_parts.append(first_line_part)
                
        # Read subsequent lines
        for j in range(found_idx + 1, len(lines)):
            next_line = lines[j]
            # Stop condition
            if next_line.startswith("■") or next_line.startswith("※") or next_line.startswith("【"):
                break
            if any(skw in next_line for skw in stop_keywords):
                break
            if next_line in ["【", "】", "【店舗サイト】"]:
                break
            # Time / Part indicators stop (e.g., 13:00, 1部, 13時)
            if re.search(r"\d", next_line) and any(t_kw in next_line for t_kw in ["時", "分", "部", ":", "："]):
                break
                
            venue_parts.append(next_line)
            
        # Join parts and clean up
        venue_str = " ".join(venue_parts).strip()
        venue_str = re.sub(r"\s*【\s*$", "", venue_str)
        venue_str = re.sub(r"\s*\|+$", "", venue_str).strip()
        
        if venue_str:
            return venue_str

    if "劇場" in text or "公演" in text:
        return "SKE48劇場"
        
    return "외부 행사장"

def parse_schedule_detail(url, session, members_list, item_type, category):
    """
    개별 세부 스케줄 페이지를 방문하여 공연정보를 획득하고,
    타입(live02, live04, live05, live06) 분기에 맞추어 출연진을 빌드합니다.
    """
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
        
    full_text_area = soup.select_one("div.wrap--main div.txt")
    full_text = full_text_area.get_text("\n") if full_text_area else ""
    
    time_str = extract_performance_time(first_p_text)
    venue_str = extract_venue(first_p_text, full_text)
    
    # 스케줄 유형(Type)에 따른 출연 멤버 매핑 분기 제어
    cast_ids = []
    
    if item_type == "live05":
        # 모든 멤버 일괄 포함
        cast_ids = [m.get("memberId") for m in members_list if m.get("memberId")]
    elif item_type in ["live04", "live06", "live07"]:
        # 상세페이지 하단 해시태그 스팬 리스트 매핑
        cast_ids = parse_tags_members(soup, members_list)
    else:
        # 기존 live02 본문 문자열 슬라이싱 매핑 방식
        cast_ids = clean_and_match_members(second_p_text, members_list)
        if not cast_ids and len(mso_elements) > 0:
            full_text_area = soup.select_one("div.wrap--main div.txt")
            if full_text_area:
                cast_ids = clean_and_match_members(full_text_area.get_text(), members_list)
                
    if not cast_ids:
        # 페이지 전체에서 로드된 멤버 이름이 있는지 매칭하여 cast_ids를 채웁니다.
        page_text = soup.get_text()
        cleaned_page_text = re.sub(r"\s+", "", page_text)
        for member in members_list:
            member_name = member.get("name", "")
            member_id = member.get("memberId", "")
            if member_name and member_id:
                cleaned_m_name = re.sub(r"\s+", "", member_name)
                if cleaned_m_name in cleaned_page_text:
                    if member_id not in cast_ids:
                        cast_ids.append(member_id)
            
    return {
        "category": category, 
        "title": title,
        "date": date_formatted,
        "time": time_str,
        "venue": venue_str,
        "status": "SCHEDULED",
        "castIds": cast_ids,
        "link": url
    }

def fetch_tixplus_theater_tickets(session=None):
    """
    https://tixplus.jp/feature/ske48_theater_ticket/ 페이지에서
    극장 공연 티켓팅 스케줄 및 신청 링크 정보를 크롤링합니다.
    """
    url = "https://tixplus.jp/feature/ske48_theater_ticket/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    sess = session if session is not None else requests.Session()
    
    try:
        print(f"\n[티켓팅 정보] tixplus 극장 공연 티켓팅 스케줄 수집 시작 ({url})")
        response = sess.get(url, headers=headers, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f"   [경고] tixplus 극장 티켓팅 페이지 로드 실패: {e}")
        return []
        
    soup = BeautifulSoup(response.text, "html.parser")
    ticket_items = []
    
    for block in soup.select("div.block"):
        tit_elem = block.select_one(".acdTit")
        if not tit_elem:
            continue
            
        title = ""
        perf_datetime = ""
        for dl in tit_elem.select("dl"):
            dt = dl.select_one("dt")
            dd = dl.select_one("dd")
            if dt and dd:
                dt_txt = dt.get_text(strip=True)
                dd_txt = dd.get_text(strip=True)
                if "公演タイトル" in dt_txt or "タイトル" in dt_txt:
                    title = dd_txt
                elif "公演日時" in dt_txt or "日時" in dt_txt:
                    perf_datetime = dd_txt
                    
        if not perf_datetime:
            continue
            
        # 날짜 추출: 2026年8月24日(月) -> 2026-08-24
        date_match = re.search(r"(\d{4})[年/\.](\d{1,2})[月/\.](\d{1,2})", perf_datetime)
        date_str = ""
        if date_match:
            y, m, d = date_match.groups()
            date_str = f"{int(y):04d}-{int(m):02d}-{int(d):02d}"
            
        # 개연 시간 추출: 開演18:30 -> 18:30
        time_match = re.search(r"開演\s*(\d{1,2}:\d{2})", perf_datetime)
        time_str = time_match.group(1) if time_match else ""
        
        wrap = block.select_one(".acdWrap")
        dls_dict = {}
        apply_links = []
        other_links = []
        
        if wrap:
            for dl in wrap.select(".box > dl"):
                dt = dl.select_one("dt")
                dd = dl.select_one("dd")
                if dt and dd:
                    k = dt.get_text(strip=True)
                    v = dd.get_text(" ", strip=True)
                    dls_dict[k] = v
                    
            for btn in wrap.select(".btnArea .btn a"):
                href = btn.get("href", "").strip()
                name = btn.get_text(strip=True)
                if href and href != "#" and not href.startswith("javascript"):
                    apply_links.append({"name": name, "url": href})
                    
            for plink in wrap.select(".linkArea p.link a"):
                href = plink.get("href", "").strip()
                name = plink.get_text(strip=True)
                if href:
                    other_links.append({"name": name, "url": href})
                    
        ticket_items.append({
            "title": title,
            "datetime": perf_datetime,
            "date": date_str,
            "time": time_str,
            "ticketInfo": {
                "applicationPeriod": dls_dict.get("受付期間", ""),
                "lotteryResultPeriod": dls_dict.get("当落発表・入金期間", ""),
                "ticketDisplay": dls_dict.get("電子チケット表示", ""),
                "tradePeriod": dls_dict.get("チケットトレード期間", ""),
                "notes": dls_dict.get("本公演の注意事項", ""),
                "applyLinks": apply_links,
                "otherLinks": other_links,
                "tixplusUrl": url
            }
        })
        
    print(f"   -> 총 {len(ticket_items)}건의 tixplus 극장 티켓팅 일정 파싱 완료")
    return ticket_items

def match_ticket_info(perf, tixplus_tickets):
    """
    극장 공연 일정(perf)에 대응되는 tixplus 티켓 정보를 매칭하여 반환합니다.
    """
    if not tixplus_tickets or not perf.get("date"):
        return None
        
    p_date = perf.get("date")
    p_time = perf.get("time") or ""
    p_title = perf.get("title") or ""
    
    # 1차: 날짜 일치 후보 필터링
    candidates = [t for t in tixplus_tickets if t["date"] == p_date]
    if not candidates:
        return None
        
    if len(candidates) == 1:
        return candidates[0]["ticketInfo"]
        
    # 2차: 시간 일치 우선
    if p_time:
        for c in candidates:
            if c["time"] and c["time"] == p_time:
                return c["ticketInfo"]
                
    # 3차: 타이틀 키워드 유사도 매칭
    def normalize_title_for_match(t_str):
        return re.sub(r"[\s\<\>＜＞「」『』【】・\-_]", "", t_str).lower()
        
    p_norm = normalize_title_for_match(p_title)
    best_candidate = None
    max_common = -1
    
    for c in candidates:
        c_norm = normalize_title_for_match(c["title"])
        score = 0
        if c_norm in p_norm or p_norm in c_norm:
            score += 100
        for kw in ["reset", "制服の芽", "シアターの女神", "ずっと君を探している", "可能性こそが未来", "生誕祭", "卒業公演", "fc会員限定"]:
            if kw in p_norm and kw in c_norm:
                score += 50
        if score > max_common:
            max_common = score
            best_candidate = c
            
    if best_candidate:
        return best_candidate["ticketInfo"]
        
    return candidates[0]["ticketInfo"]

def scrape_monthly_schedules(year, month, members_list, tixplus_tickets=None):
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
    
    target_classes = ["live02", "live04", "live05", "live06", "live07"]
    schedule_items = []
    seen_urls = set()  # 데이터 중복 수집 차단용 셋(Set)
    
    for class_name in target_classes:
        # [해결] div.entry.[클래스명] 형태로 타겟팅 범위를 정교화합니다 [1].
        for parent_div in soup.select(f"div.entry.{class_name}"):
            a_tag = parent_div.select_one("a")
            if not a_tag:
                continue
                
            href = a_tag.get("href")
            if not href:
                continue
                
            if href.startswith("/"):
                href = "https://ske48.co.jp" + href
                
            # [중복 방지] 이미 스캔 대상에 추가된 URL이라면 스킵합니다.
            if href in seen_urls:
                continue
            seen_urls.add(href)
                
            # [해결] a 태그 하위에 직접 속해있는 p.cat.scheduleCateIco 요소를 추출합니다 [1].
            category_text = "기타"
            cat_tag = a_tag.select_one("p.cat.scheduleCateIco")
            if not cat_tag:
                # 폴백: parent_div 내부의 모든 p.cat 혹은 .scheduleCateIco를 검색해 안전을 기합니다.
                cat_tag = parent_div.select_one("p.cat.scheduleCateIco, p.cat, .scheduleCateIco")
                
            if cat_tag:
                # [해결] 자식 span 태그를 제외한 p 노드 본래의 카테고리 텍스트(예: メディア)만 분리해 가져옵니다 [1].
                category_text = "".join([c for c in cat_tag.contents if isinstance(c, str)]).strip()
                
            schedule_items.append({
                "url": href,
                "type": class_name,
                "category": category_text
            })
            
    total_schedules = len(schedule_items)
    print(f"총 {total_schedules}개의 필터링된 스케줄을 수집했습니다. (중복 배제 완료)")
    
    raw_performances = []
    
    # 1. 상세 페이지 분석 후 데이터를 가배열(raw_performances)에 적재
    for idx, item in enumerate(schedule_items, 1):
        print(f"[{idx}/{total_schedules}] 스케줄 상세 분석 ({item['type']}): {item['url']}")
        
        perf_data = parse_schedule_detail(
            item["url"], 
            session, 
            members_list, 
            item_type=item["type"], 
            category=item["category"]
        )
        
        if perf_data:
            # 극장 공연일 경우 tixplus 티켓 정보 매칭
            is_theater = (
                perf_data.get("category") == "公演" or 
                "劇場" in perf_data.get("venue", "") or 
                "SKE48劇場" in perf_data.get("venue", "") or
                item["type"] == "live02" or 
                "公演" in perf_data.get("title", "")
            )
            if is_theater and tixplus_tickets:
                matched_ticket = match_ticket_info(perf_data, tixplus_tickets)
                if matched_ticket:
                    perf_data["ticketInfo"] = matched_ticket
                    print(f"   -> [티켓 매칭 성공] {matched_ticket.get('applicationPeriod')}")
                    
            raw_performances.append(perf_data)
        time.sleep(0.2)
        
    # 2. 기존 파일이 존재하면 읽어옵니다.
    file_name = f"data/performances_{year}_{int(month):02d}.json"
    existing_performances = []
    if os.path.exists(file_name):
        try:
            with open(file_name, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                existing_performances = existing_data.get("performances", [])
            print(f"기존 '{file_name}'에서 {len(existing_performances)}개의 일정을 불러왔습니다.")
        except Exception as e:
            print(f"[경고] 기존 '{file_name}' 파일 로드 실패 (새로 생성합니다): {e}")

    # 3. ID 접두사 정의 및 기존 ID 매핑 / 최대 인덱스 파악
    year_short = str(year)[-2:]
    month_formatted = f"{int(month):02d}"
    id_prefix = f"P{year_short}{month_formatted}"
    
    existing_map = {p.get("link"): p for p in existing_performances if p.get("link")}
    
    max_idx = 0
    for p in existing_performances:
        p_id = p.get("performanceId", "")
        if p_id.startswith(id_prefix + "_"):
            try:
                suffix = int(p_id.split("_")[1])
                if suffix > max_idx:
                    max_idx = suffix
            except (ValueError, IndexError):
                pass
                
    updated_count = 0
    added_count = 0
    merged_performances = list(existing_performances)
    
    for perf_data in raw_performances:
        url = perf_data.get("link")
        if url and url in existing_map:
            # 기존 공연이 있으므로 정보 업데이트 (기존 ID 및 status 보존)
            existing_perf = existing_map[url]
            current_status = existing_perf.get("status", "SCHEDULED")
            
            # 새 데이터에 ticketInfo가 없지만 기존에 이미 저장된 ticketInfo가 있다면 보존
            if "ticketInfo" not in perf_data and "ticketInfo" in existing_perf:
                perf_data["ticketInfo"] = existing_perf["ticketInfo"]
                
            # 정보 업데이트
            existing_perf.update(perf_data)
            # status 복구
            existing_perf["status"] = current_status
            updated_count += 1
        else:
            # 새로운 공연이므로 ID 신규 부여 후 추가
            max_idx += 1
            new_id = f"{id_prefix}_{max_idx:02d}"
            new_perf = {
                "performanceId": new_id,
                **perf_data
            }
            merged_performances.append(new_perf)
            if url:
                existing_map[url] = new_perf
            added_count += 1
            
    # 최종 병합된 리스트를 날짜(date) -> 시간(time) 오름차순으로 정렬
    merged_performances.sort(key=lambda x: (x.get("date", "9999-12-31"), x.get("time") or "00:00"))
    
    output_data = {
        "yearMonth": f"{int(year):04d}-{int(month):02d}",
        "performances": merged_performances
    }
    
    os.makedirs("data", exist_ok=True)
    
    with open(file_name, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"-> 수집 및 업데이트 완료: {file_name}")
    print(f"   - 신규 추가 일정: {added_count}건")
    print(f"   - 기존 정보 업데이트: {updated_count}건")
    print(f"   - 최종 총 일정 수: {len(merged_performances)}건")

if __name__ == "__main__":
    today = datetime.date.today()
    
    current_year = today.year
    current_month = today.month
    
    first_day_of_current_month = today.replace(day=1)
    next_month_date = first_day_of_current_month + datetime.timedelta(days=32)
    next_year = next_month_date.year
    next_month = next_month_date.month
    
    first_day_of_next_month = next_month_date.replace(day=1)
    next_next_month_date = first_day_of_next_month + datetime.timedelta(days=32)
    next_next_year = next_next_month_date.year
    next_next_month = next_next_month_date.month
    
    members_list = load_local_members()
    
    # tixplus 극장 공연 티켓팅 정보 사전 수집
    tixplus_session = requests.Session()
    tixplus_tickets = fetch_tixplus_theater_tickets(tixplus_session)
    
    scrape_monthly_schedules(current_year, current_month, members_list, tixplus_tickets)
    scrape_monthly_schedules(next_year, next_month, members_list, tixplus_tickets)
    scrape_monthly_schedules(next_next_year, next_next_month, members_list, tixplus_tickets)