import os
import re
import json
import requests
from bs4 import BeautifulSoup
import time

def clean_name(raw_text):
    """
    '相川暖花HONOKA AIKAWA'와 같이 일본어 이름과 영문 이름이 
    하나의 태그 안에 붙어 있는 경우 정규식으로 분리합니다.
    """
    raw_text = raw_text.strip()
    match = re.match(r"^([^\x00-\x7F\s]+)\s*([A-Z\s\-]+)$", raw_text)
    if match:
        jp_name = match.group(1).strip()
        en_name = match.group(2).strip()
        return jp_name, en_name
    return raw_text, ""

def parse_individual_profile(url, session, team_name):
    """
    개별 멤버 페이지를 방문하여 프로필 이미지, 이름, 상세 정보를 파싱합니다.
    팀이름(position)은 메인 페이지 탭 매핑을 통해 정제된 값을 주입받습니다.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = session.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"   [오류] {url} 상세 페이지 요청 실패: {e}")
        return None
        
    soup = BeautifulSoup(response.text, "html.parser")
    
    # 1. 프로필 이미지 URL 찾기
    main_img_url = ""
    img_selectors = [
        "div.profile-image img", 
        "div.profile-photo img", 
        "div.img img",
        "div.profile_img img"
    ]
    
    for selector in img_selectors:
        selected_img = soup.select_one(selector)
        if selected_img:
            main_img_url = selected_img.get("src") or selected_img.get("data-src") or ""
            if main_img_url:
                break
                
    if not main_img_url:
        for img in soup.find_all("img"):
            src = img.get("src") or img.get("data-src") or ""
            if src and not any(x in src.lower() for x in ["logo", "icon", "sns", "header", "footer", "spacer", "common"]):
                if "profile" in src.lower() or "member" in src.lower() or "photo" in src.lower():
                    main_img_url = src
                    break

    if main_img_url and main_img_url.startswith("/"):
        main_img_url = "https://ske48.co.jp" + main_img_url
        
    # 2. 이미지 파일명을 기반으로 memberId 추출
    filename = os.path.basename(main_img_url) if main_img_url else ""
    member_id = os.path.splitext(filename)[0] if filename else "unknown_member"
    
    slug = url.split("/")[-1]
    if member_id in ["", "image", "profile", "photo", "member", "unknown_member"]:
        member_id = slug
    
    # 3. 이름(Name) 추출 (dt.member_name 우선순위 적용)
    raw_name = ""
    name_selectors = ["dt.member_name", "h1", "h2", ".name", ".profile-name"]
    for selector in name_selectors:
        name_tag = soup.select_one(selector)
        if name_tag:
            raw_name = name_tag.get_text(separator=" ", strip=True)
            break
            
    raw_name = raw_name.replace("PROFILE", "").strip()
    jp_name, en_name = clean_name(raw_name)
    name = jp_name if jp_name else raw_name
            
    if not name or "SKE48" in name:
        title_text = soup.title.string if soup.title else ""
        if "｜" in title_text:
            name = title_text.split("｜")[0].strip()
        elif "|" in title_text:
            name = title_text.split("|")[0].strip()
        else:
            name = slug.replace("_", " ").title()
            
    # 4. 소속 팀(Position) 지정
    position = team_name
            
    # 5. 세부 정보 데이터 추출
    profile_details = {}
    known_keys = [
        "ニックネーム", "生年月日", "血液型", "出身地", "身長", 
        "キャッチフレーズ", "メンバーカラー", "趣味", "特技", 
        "将来の夢", "好きな食べ物", "好きな言葉", "一言メッセージ"
    ]
    
    # <dt> <dd> 매칭
    for dt in soup.find_all('dt'):
        dt_text = dt.get_text(strip=True)
        for kk in known_keys:
            if kk in dt_text:
                dd = dt.find_next_sibling('dd')
                if dd:
                    profile_details[kk] = dd.get_text(strip=True)
                break
                
    # <li> 리스트 내 텍스트 매칭
    for li in soup.find_all('li'):
        li_text = li.get_text(strip=True)
        for kk in known_keys:
            if li_text.startswith(kk) and kk not in profile_details:
                val = li_text[len(kk):].strip()
                val = re.sub(r"^[:：\s・]+", "", val)
                profile_details[kk] = val
                break
                
    # 6. 세부 데이터를 결합하여 소개글(Bio) 완성 (다국어 지원)
    nickname = profile_details.get("ニックネーム", "")
    birth = profile_details.get("生年月日", "")
    hometown = profile_details.get("出身地", "")
    catchphrase = profile_details.get("キャッチフレーズ", "")
    
    # 한국어 Bio
    ko_parts = []
    if nickname:
        ko_parts.append(f"닉네임은 '{nickname}'입니다.")
    if birth:
        ko_parts.append(f"생년월일은 {birth}입니다.")
    if hometown:
        ko_parts.append(f"출신지는 {hometown}입니다.")
    if catchphrase:
        ko_parts.append(f"캐치프레이즈: \"{catchphrase}\"")
    ko_bio = " ".join(ko_parts) if ko_parts else f"SKE48 멤버 {name}의 공식 프로필입니다."

    # 일본어 Bio
    ja_parts = []
    if nickname:
        ja_parts.append(f"ニックネームは「{nickname}」です。")
    if birth:
        ja_parts.append(f"生年月日は{birth}です。")
    if hometown:
        ja_parts.append(f"出身地は{hometown}です。")
    if catchphrase:
        ja_parts.append(f"キャッチフレーズ：「{catchphrase}」")
    ja_bio = " ".join(ja_parts) if ja_parts else f"SKE48メンバー{name}の公式プロフィールです。"

    # 영어 Bio
    en_parts = []
    if nickname:
        en_parts.append(f"Nickname is '{nickname}'.")
    if birth:
        en_parts.append(f"Date of birth is {birth}.")
    if hometown:
        en_parts.append(f"Hometown is {hometown}.")
    if catchphrase:
        en_parts.append(f"Catchphrase: \"{catchphrase}\"")
    en_bio = " ".join(en_parts) if en_parts else f"Official profile of SKE48 member {name}."

    bio = {
        "ko": ko_bio,
        "ja": ja_bio,
        "en": en_bio
    }
    
    return {
        "memberId": member_id,
        "name": name,
        "position": position,
        "profileImageUrl": main_img_url,
        "bio": bio,
        "details": {
            "nickname": nickname,
            "birthdate": birth,
            "bloodType": profile_details.get("血液型", ""),
            "hometown": hometown,
            "height": profile_details.get("身長", ""),
            "memberColor": profile_details.get("メンバーカラー", ""),
            "hobby": profile_details.get("趣味", ""),
            "specialty": profile_details.get("特技", "")
        }
    }

def download_image_locally(url, member_id, session):
    """
    원격 이미지 URL을 다운로드하여 로컬 images/ 디렉토리에 저장합니다.
    저장 후 로컬 상대 경로(예: 'images/member_xx.jpg')를 반환합니다.
    """
    if not url or not url.startswith("http"):
        return url
        
    try:
        # 확장자 추출 (기본값 .jpg)
        filename = os.path.basename(url.split("?")[0])
        ext = os.path.splitext(filename)[1]
        if not ext:
            ext = ".jpg"
            
        local_dir = "images"
        os.makedirs(local_dir, exist_ok=True)
        
        local_filename = f"{member_id}{ext}"
        local_path = os.path.join(local_dir, local_filename)
        
        # 이미 로컬 파일이 존재한다면 다운로드 건너뜀
        if os.path.exists(local_path):
            return f"images/{local_filename}"
            
        print(f"   [이미지 다운로드] {member_id} 프로필 이미지 다운로드 중...")
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = session.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        with open(local_path, "wb") as f:
            f.write(response.content)
            
        print(f"   [이미지 다운로드] 저장 성공: {local_path}")
        return f"images/{local_filename}"
    except Exception as e:
        print(f"   [이미지 다운로드 실패] {url} -> {e}")
        return url

def start_integration_crawl():
    index_url = "https://ske48.co.jp/feature/profile"
    
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    
    try:
        print("메인 프로필 목록 페이지를 로드 중입니다...")
        response = session.get(index_url, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"메인 페이지 로드 오류: {e}")
        return
        
    soup = BeautifulSoup(response.text, "html.parser")
    
    # 1. 상단 탭 블록 (ul.tab_nav) 파싱 진행
    team_mapping = {}
    tab_nav = soup.select_one("ul.tab_nav")
    
    if tab_nav:
        # A. Slick 라이브러리에 의해 data-slick-index가 정상 주입된 상태인 경우
        for slide in tab_nav.select("[data-slick-index]"):
            if "slick-cloned" in slide.get("class", []):
                continue
            idx = slide.get("data-slick-index")
            txt = slide.get_text(strip=True)
            if idx is not None and txt:
                parts = re.split(r"[\s/|]+", txt)
                if parts:
                    txt = parts[0].strip()
                team_mapping[idx] = txt
                
        # B. 만약 DOM 생성 지연 등으로 data-slick-index 속성이 잡히지 않을 경우, li 배치 물리 순번으로 대체 매핑
        if not team_mapping:
            print(" -> data-slick-index 속성을 찾지 못해 순서 번호(li 순번) 기반으로 매핑을 보완합니다.")
            for i, li in enumerate(tab_nav.select("li")):
                txt = li.get_text(strip=True)
                if txt:
                    parts = re.split(r"[\s/|]+", txt)
                    if parts:
                        txt = parts[0].strip()
                    team_mapping[str(i)] = txt
    else:
        print(" -> [주의] ul.tab_nav 요소를 돔에서 찾지 못했습니다. 기본 매핑 정보를 사용합니다.")
        team_mapping = {"0": "チームS", "1": "チームKⅡ", "2": "チームE", "3": "研究生"}
                    
    print(f"상단 탭(ul.tab_nav) 매핑 결과: {team_mapping}")

    # 2. 하단 영역 (ul.tab_content) 내부의 각 팀 블록들 탐색
    team_blocks = []
    tab_content = soup.select_one("ul.tab_content")
    
    if tab_content:
        # ul.tab_content 자식 요소 중 block--team 클래스를 가지는 요소 수집
        team_blocks = [
            div for div in tab_content.find_all(True) 
            if div.get("class") and "block--team" in div.get("class")
        ]
    else:
        # Fallback: ul.tab_content를 찾지 못한 경우 전역 범위에서 block--team 수집
        team_blocks = [
            div for div in soup.find_all("div") 
            if div.get("class") and "block--team" in div.get("class")
        ]
        
    print(f"하단 영역(ul.tab_content) 내에서 {len(team_blocks)}개의 팀 블록을 발견했습니다.")
    
    all_members = []
    
    # 3. 수집된 각 팀 블록을 돌며 데이터 구성
    for block in team_blocks:
        slick_index = block.get("data-slick-index")
        block_id = block.get("id", "unknown_team")
        
        # 만약 block에 data-slick-index가 없다면, 팀 블록 리스트에서의 인덱스 번호를 대조해봅니다.
        if slick_index is None:
            slick_index = str(team_blocks.index(block))
            
        # 상단 탭에서 빌드한 매핑 테이블을 토대로 팀명을 획득하며, 실패 시 엘리먼트의 id 속성을 사용합니다.
        team_name = team_mapping.get(slick_index, block_id)
        print(f"\n[팀 매핑] ID: {block_id} | Index: {slick_index} -> 최종 팀이름: '{team_name}'")
        
        # 해당 팀 블록 내의 멤버 상세 페이지 링크 수집 [1]
        member_tags = block.select("ul.item_link_nav > li > a")
        member_urls = []
        for a_tag in member_tags:
            href = a_tag.get("href")
            if not href:
                continue
                
            if href.startswith("/"):
                href = "https://ske48.co.jp" + href
                
            if "ske48.co.jp/feature/" in href and not href.endswith("/profile"):
                if href not in member_urls:
                    member_urls.append(href)
                    
        print(f" -> 멤버 수: {len(member_urls)}명")
        
        for member_url in member_urls:
            slug = member_url.split("/")[-1]
            print(f"   - 파싱 진행: {slug} (소속: {team_name})")
            
            profile_data = parse_individual_profile(member_url, session, team_name=team_name)
            
            if profile_data:
                all_members.append(profile_data)
                print(f"     -> 수집 성공: ID='{profile_data['memberId']}', 이름='{profile_data['name']}'")
            else:
                print(f"     -> 파싱 실패: {member_url}")
                
            time.sleep(0.5)
            
    # 기존 파일이 존재하면 읽어서 업데이트 진행
    output_path = os.path.join("data", "members.json")
    existing_members = []
    if os.path.exists(output_path):
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                existing_members = existing_data.get("members", [])
            print(f"기존 '{output_path}'에서 {len(existing_members)}명의 데이터를 불러왔습니다.")
        except Exception as e:
            print(f"[경고] 기존 '{output_path}' 파일 로드 실패 (새로 생성합니다): {e}")

    # memberId 기준 매핑 생성
    member_map = {m["memberId"]: m for m in existing_members}
    
    updated_count = 0
    added_count = 0
    graduated_count = 0
    
    crawled_ids = {m["memberId"] for m in all_members}
    
    for new_m in all_members:
        m_id = new_m["memberId"]
        if m_id in member_map:
            # 기존 정보 업데이트 (기존에 졸업 상태였다가 활성화된 경우 대비)
            member_map[m_id].pop("isGraduated", None)
            member_map[m_id].update(new_m)
            updated_count += 1
        else:
            # 새 멤버 추가
            existing_members.append(new_m)
            member_map[m_id] = new_m
            added_count += 1
            
    # 프로필 사이트에 없는 멤버는 졸업멤버로 변경
    for m_id, existing_m in member_map.items():
        if m_id not in crawled_ids:
            if existing_m.get("position") != "졸업멤버" or not existing_m.get("isGraduated"):
                existing_m["position"] = "졸업멤버"
                existing_m["isGraduated"] = True
                graduated_count += 1
            
            # 졸업멤버인 경우 이미지 URL을 로컬로 다운로드
            current_img_url = existing_m.get("profileImageUrl", "")
            if current_img_url and current_img_url.startswith("http"):
                local_img_path = download_image_locally(current_img_url, m_id, session)
                existing_m["profileImageUrl"] = local_img_path
            
    # 최종 결과 저장
    output_data = {"members": existing_members}
    
    # data 폴더가 없을 경우 생성
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"\n모든 작업 완료!")
    print(f" - 저장 경로: {output_path}")
    print(f" - 신규 추가 멤버: {added_count}명")
    print(f" - 정보 갱신 멤버: {updated_count}명")
    print(f" - 졸업 처리 멤버: {graduated_count}명")
    print(f" - 최종 저장된 총 멤버 수: {len(existing_members)}명")


if __name__ == "__main__":
    start_integration_crawl()