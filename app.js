// i18n 번역 사전
const translations = {
    ko: {
        title: "SKE48 극장 스케줄 & 프로필 포탈",
        monthLabel: "{year}년 {month}월",
        prevMonth: "이전 달",
        nextMonth: "다음 달",
        tabSchedule: "극장 스케줄",
        tabProfiles: "멤버 프로필",
        teamCountLabel: "({count}명)",
        profilePlaceholder: "우측 멤버 카드 또는 라인업을 선택하면<br>상세 프로필과 이번 달 개인 스케줄이 이곳에 나타납니다.",
        detailPlaceholder: "타임라인에서 날짜를 선택해주시면 해당일의 세부 정보가 여기에 등장합니다.",
        noPerformance: "공연 없음",
        noPerformanceDetail: "이 날은 예정된 극장 공연이 존재하지 않습니다.",
        castLineup: "출연진 라인업 ({count}명)",
        date: "날짜",
        time: "시간",
        location: "장소",
        personalSchedule: "📅 {month}월 개인 스케줄 리스트 ({count}회 출연)",
        noPersonalSchedule: "이번 달 지정된 공연 스케줄이 존재하지 않습니다.",
        datetime: "일시",
        performance: "공연",
        cast: "출연진",
        errLoadMembers: "data/members.json 로드 실패. 서버 CORS 차단 유무 및 경로를 검사해 주세요.",
        errLoadSchedule: "스케줄 로딩 실패 ({year}년 {month}월)",
        loadingMembers: "멤버 데이터 로딩 중...",
        loadingSchedule: "data/performances_{year}_{month}.json 스케줄 로딩 중...",
        
        accordionDetail: "세부 프로필 정보",
        labelNickname: "닉네임",
        labelBirthdate: "생년월일",
        labelBloodType: "혈액형",
        labelHometown: "출신지",
        labelHeight: "신장",
        labelMemberColor: "멤버 컬러",
        labelHobby: "취미",
        labelSpecialty: "특기"
    },
    ja: {
        title: "SKE48 劇場スケジュール＆プロフィールポータル",
        monthLabel: "{year}年 {month}月",
        prevMonth: "前月",
        nextMonth: "翌月",
        tabSchedule: "劇場スケジュール",
        tabProfiles: "メンバープロフィール",
        teamCountLabel: "({count}人)",
        profilePlaceholder: "メンバーカード 또는 출연キャストを選択すると、<br>詳細プロフィール와 今月のスケジュール이 여기에 표시됩니다.",
        detailPlaceholder: "タイムラインから日付を選択すると、その日の詳細情報가 여기에 표시됩니다.",
        noPerformance: "公演なし",
        noPerformanceDetail: "この日は 예정된 劇場公演이 없습니다.",
        castLineup: "出演キャスト ({count}名)",
        date: "日付",
        time: "時間",
        location: "場所",
        personalSchedule: "📅 {month}月の個人スケジュール一覧 ({count}回出演)",
        noPersonalSchedule: "今月の公演スケジュールはありません.",
        datetime: "日時",
        performance: "公演",
        cast: "出演キャスト",
        errLoadMembers: "data/members.json の読み込みに失敗しました。CORS制限またはパスを確認してください.",
        errLoadSchedule: "スケジュールの読み込みに失敗しました（{year}年{month}月）",
        loadingMembers: "メンバーデータ読み込み중...",
        loadingSchedule: "data/performances_{year}_{month}.json schedule 読み込み중...",
        
        accordionDetail: "詳細プロフィール",
        labelNickname: "ニックネーム",
        labelBirthdate: "生年月日",
        labelBloodType: "血液型",
        labelHometown: "出身地",
        labelHeight: "身長",
        labelMemberColor: "メンバーカラー",
        labelHobby: "趣味",
        labelSpecialty: "特技"
    },
    en: {
        title: "SKE48 Theater Schedule & Profile Portal",
        monthLabel: "{year}-{month}",
        prevMonth: "Prev Month",
        nextMonth: "Next Month",
        tabSchedule: "Theater Schedule",
        tabProfiles: "Member Profiles",
        teamCountLabel: "({count} members)",
        profilePlaceholder: "Select a member card or cast member<br>to view their profile and personal schedule for this month here.",
        detailPlaceholder: "Select a date from the timeline to view detailed performance information here.",
        noPerformance: "No Performance",
        noPerformanceDetail: "There are no theater performances scheduled for this day.",
        castLineup: "Cast Lineup ({count} members)",
        date: "Date",
        time: "Time",
        location: "Location",
        personalSchedule: "📅 {month} Personal Schedule ({count} shows)",
        noPersonalSchedule: "No scheduled performances for this month.",
        datetime: "Date/Time",
        performance: "Performance",
        cast: "Cast",
        errLoadMembers: "Failed to load data/members.json. Please check local server CORS restrictions.",
        errLoadSchedule: "Failed to load schedule ({year}-{month})",
        loadingMembers: "Loading member data...",
        loadingSchedule: "Loading schedule data/performances_{year}_{month}.json...",
        
        accordionDetail: "Detailed Profile",
        labelNickname: "Nickname",
        labelBirthdate: "Birthdate",
        labelBloodType: "Blood Type",
        labelHometown: "Hometown",
        labelHeight: "Height",
        labelMemberColor: "Member Color",
        labelHobby: "Hobby",
        labelSpecialty: "Specialty"
    }
};

let currentLang = localStorage.getItem("ske_lang") || (navigator.language.startsWith("ja") ? "ja" : navigator.language.startsWith("en") ? "en" : "ko");

function t(key, vars = {}) {
    let text = translations[currentLang][key] || key;
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
}

// 전역 상태 변수
let membersData = []; 
let currentMonthPerformances = []; 
let activeSelectedDay = null; 
let activeViewMode = "schedule"; 

// 실제 '오늘 날짜' 데이터를 실시간으로 가져와 전역 설정합니다 [1].
const systemToday = new Date();
let viewYear = systemToday.getFullYear();
let viewMonth = systemToday.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더합니다.

// 초기 실행 환경 구성
async function initApplication() {
    document.getElementById("lang-select").value = currentLang;
    updateStaticPlaceholders();

    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error("members.json 데이터 로드 실패");
        }
        const data = await response.json();
        membersData = data.members || [];
    } catch (error) {
        console.error("초기 기동 에러:", error);
        showInitializationError(t("errLoadMembers"));
        return;
    }
    
    await loadTimeline();
    renderTeamBasedProfiles(); 
}

// 뷰 전환 통제
function switchViewMode(mode) {
    activeViewMode = mode;
    
    const tabBtnSchedule = document.getElementById("tab-btn-schedule");
    const tabBtnProfiles = document.getElementById("tab-btn-profiles");
    const scheduleArea = document.getElementById("schedule-view-area");
    const profilesArea = document.getElementById("profiles-view-area");

    if (mode === "schedule") {
        tabBtnSchedule.classList.add("active");
        tabBtnProfiles.classList.remove("active");
        scheduleArea.style.display = "flex";
        profilesArea.style.display = "none";
    } else if (mode === "profiles") {
        tabBtnSchedule.classList.remove("active");
        tabBtnProfiles.classList.add("active");
        scheduleArea.style.display = "none";
        profilesArea.style.display = "block";
        renderTeamBasedProfiles(); 
    }
}

function updateStaticPlaceholders() {
    document.title = t("title");
    document.getElementById("btn-prev-month").textContent = `< ${t("prevMonth")}`;
    document.getElementById("btn-next-month").textContent = `${t("nextMonth")} >`;
    document.getElementById("tab-btn-schedule").textContent = t("tabSchedule");
    document.getElementById("tab-btn-profiles").textContent = t("tabProfiles");

    const leftPanelContent = document.getElementById("left-panel-content");
    if (!leftPanelContent.querySelector(".profile-card")) {
        leftPanelContent.innerHTML = `<div class="profile-placeholder"><p>${t("profilePlaceholder")}</p></div>`;
    }

    const detailWrapper = document.getElementById("detail-wrapper");
    if (!detailWrapper.querySelector(".detail-header") && !detailWrapper.querySelector(".loading-text")) {
        detailWrapper.innerHTML = `<div class="profile-placeholder"><p>${t("detailPlaceholder")}</p></div>`;
    }
}

// 모바일 전용 서랍장 닫기 제어 함수 [1]
function closeMobileDrawer() {
    document.getElementById("left-panel").classList.remove("drawer-active");
    document.getElementById("drawer-overlay").classList.remove("active");
}

// 멤버를 팀별로 그룹화 및 순서(S -> KII -> E -> 연구생)대로 구분 나열
function renderTeamBasedProfiles() {
    const container = document.getElementById("profiles-view-area");
    container.innerHTML = ""; 

    const grouped = {};
    membersData.forEach(member => {
        const team = member.position || "SKE48";
        if (!grouped[team]) {
            grouped[team] = [];
        }
        grouped[team].push(member);
    });

    const officialOrder = ["Team S", "チームS", "Team KⅡ", "Team KII", "チームKⅡ", "Team E", "チームE", "研究生"];
    const sortedTeamNames = Object.keys(grouped).sort((a, b) => {
        const indexA = officialOrder.findIndex(term => a.toUpperCase().includes(term.toUpperCase()) || term.toUpperCase().includes(a.toUpperCase()));
        const indexB = officialOrder.findIndex(term => b.toUpperCase().includes(term.toUpperCase()) || term.toUpperCase().includes(b.toUpperCase()));
        
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    sortedTeamNames.forEach(teamName => {
        const membersInTeam = grouped[teamName];
        
        const sectionDiv = document.createElement("div");
        sectionDiv.className = "team-section";

        const titleDiv = document.createElement("div");
        titleDiv.className = "cast-title";
        titleDiv.textContent = `${teamName} ${t("teamCountLabel", { count: membersInTeam.length })}`;
        sectionDiv.appendChild(titleDiv);

        const gridDiv = document.createElement("div");
        gridDiv.className = "cast-grid";

        membersInTeam.forEach(member => {
            const card = document.createElement("div");
            card.className = "member-mini-card";
            card.onclick = () => selectMember(member.memberId, true); // 사용자가 직접 터치하여 강제 오픈 유도
            card.innerHTML = `
                <div class="img-frame">
                    <img src="${member.profileImageUrl}" alt="${member.name}" onerror="this.src='https://placehold.co/140x175/bfeae5/333333?text=${member.name}'">
                </div>
                <div class="card-name">${member.name}</div>
            `;
            gridDiv.appendChild(card);
        });

        sectionDiv.appendChild(gridDiv);
        container.appendChild(sectionDiv);
    });
}

// 달력 데이터 취합 및 타임라인 생성 시 하루 복수 공연 적층 렌더링 지원 [1]
async function loadTimeline() {
    const formattedMonth = String(viewMonth).padStart(2, '0');
    const yearMonthKey = `${viewYear}-${formattedMonth}`;
    
    document.getElementById("view-month-label").textContent = t("monthLabel", { year: viewYear, month: formattedMonth });
    
    const timelineContainer = document.getElementById("timeline-container");
    timelineContainer.innerHTML = `<div class="loading-text">${t("loadingSchedule", { year: viewYear, month: formattedMonth })}</div>`;

    try {
        const response = await fetch(`data/performances_${viewYear}_${formattedMonth}.json`);
        if (!response.ok) {
            throw new Error(`performances_${viewYear}_${formattedMonth}.json 로드 실패`);
        }
        const data = await response.json();
        currentMonthPerformances = data.performances || [];
    } catch (error) {
        console.warn(`스케줄 데이터 로드 실패 (${viewYear}-${formattedMonth}):`, error);
        currentMonthPerformances = [];
    }

    timelineContainer.innerHTML = "";
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${viewYear}-${formattedMonth}-${String(day).padStart(2, '0')}`;
        
        // 하루에 공연이 2개 이상 있을 경우를 대비하여 filter를 사용해 모두 수집합니다 [1].
        const dayPerfs = currentMonthPerformances.filter(p => p.date === dateStr);

        const dayDiv = document.createElement("div");
        dayDiv.className = "timeline-day";
        dayDiv.id = `day-element-${day}`;
        dayDiv.setAttribute("data-day", day);

        if (viewYear === systemToday.getFullYear() && viewMonth === (systemToday.getMonth() + 1) && day === systemToday.getDate()) {
            dayDiv.classList.add("today-highlight");
        }

        let contentHTML = `
            <div class="day-num">${day}</div>
            <div class="day-content">
        `;

        if (dayPerfs.length > 0) {
            // 수집된 당일의 모든 공연 정보를 루프돌며 리스트업합니다.
            dayPerfs.forEach((perf, idx) => {
                const castNames = perf.castIds.map(id => {
                    const m = membersData.find(mem => mem.memberId === id);
                    return m ? m.name : id;
                }).filter(name => name).join(", ");

                contentHTML += `
                    <div class="perf-item-wrapper" style="${idx > 0 ? 'margin-top: 8px; padding-top: 8px; border-top: 1px dotted #eee;' : ''}">
                        <div class="day-title" style="color: #00796b;">[${perf.time}] ${perf.title}</div>
                        <div class="day-cast-summary">${castNames}</div>
                    </div>
                `;
            });

            dayDiv.onclick = () => {
                activeSelectedDay = day;
                selectPerformance(dayPerfs, dayDiv); // 해당 날짜의 모든 공연 배열을 인자로 위임
            };
        } else {
            contentHTML += `
                <div class="day-title" style="color: #bbb; font-weight: normal;">${t("noPerformance")}</div>
                <div class="day-cast-summary">-</div>
            `;
            dayDiv.onclick = () => {
                activeSelectedDay = day;
                selectEmptyDay(dateStr, dayDiv);
            };
        }

        contentHTML += `</div>`;
        dayDiv.innerHTML = contentHTML;
        timelineContainer.appendChild(dayDiv);
    }

    setTimeout(() => {
        if (viewYear === systemToday.getFullYear() && viewMonth === (systemToday.getMonth() + 1)) {
            const todayElement = document.getElementById(`day-element-${systemToday.getDate()}`);
            if (todayElement) {
                todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                todayElement.click(); 
            }
        } else {
            const firstDayElement = document.getElementById(`day-element-1`);
            if (firstDayElement) firstDayElement.click();
        }
    }, 100);
}

async function changeMonth(step) {
    viewMonth += step;
    if (viewMonth > 12) {
        viewMonth = 1;
        viewYear += 1;
    } else if (viewMonth < 1) {
        viewMonth = 12;
        viewYear -= 1;
    }
    await loadTimeline();
    
    const activeProfileCard = document.querySelector(".profile-card .profile-name");
    if (activeProfileCard) {
        const memberObj = membersData.find(m => m.name === activeProfileCard.textContent);
        if (memberObj) selectMember(memberObj.memberId, false);
    }
}

async function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("ske_lang", lang); 
    
    updateStaticPlaceholders();
    await loadTimeline();

    if (activeSelectedDay && activeViewMode === "schedule") {
        const currentElement = document.getElementById(`day-element-${activeSelectedDay}`);
        if (currentElement) {
            currentElement.click();
        }
    }
    
    const activeProfileCard = document.querySelector(".profile-card .profile-name");
    if (activeProfileCard) {
        const memberObj = membersData.find(m => m.name === activeProfileCard.textContent);
        if (memberObj) selectMember(memberObj.memberId, false);
    }
}

function selectEmptyDay(dateStr, element) {
    clearActiveDay();
    element.classList.add("active");

    const detailWrapper = document.getElementById("detail-wrapper");
    detailWrapper.innerHTML = `
        <div class="detail-header">
            <h3 class="detail-title">${dateStr}</h3>
            <div class="detail-meta"><span>${t("noPerformanceDetail")}</span></div>
        </div>
    `;
}

// 특정 날짜의 모든 공연 정보(perfList)를 아울러 화면 우측에 적층 렌더링 지원 [1]
function selectPerformance(perfList, element) {
    clearActiveDay();
    element.classList.add("active");

    const detailWrapper = document.getElementById("detail-wrapper");
    
    // 단일 객체 전달 시에도 배열 형태로 일관성 있게 변환하여 순회합니다.
    const perfs = Array.isArray(perfList) ? perfList : [perfList];
    let contentHTML = "";

    perfs.forEach((perf, pIdx) => {
        let castCardsHTML = "";
        perf.castIds.forEach(id => {
            const member = membersData.find(mem => mem.memberId === id);
            if (member) {
                castCardsHTML += `
                    <div class="member-mini-card" onclick="selectMember('${member.memberId}', true)">
                        <div class="img-frame">
                            <img src="${member.profileImageUrl}" alt="${member.name}" onerror="this.src='https://placehold.co/140x175/bfeae5/333333?text=${member.name}'">
                        </div>
                        <div class="card-name">${member.name}</div>
                    </div>
                `;
            } else {
                castCardsHTML += `
                    <div class="member-mini-card" style="cursor: default;">
                        <div class="img-frame">
                            <img src="https://placehold.co/140x175/bfeae5/333333?text=${id}" alt="${id}">
                        </div>
                        <div class="card-name">${id}</div>
                    </div>
                `;
            }
        });

        // 공연이 여러 개일 경우 구분선을 두고 차례대로 쌓습니다.
        contentHTML += `
            <div class="perf-detail-block" style="${pIdx > 0 ? 'margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 30px;' : ''}">
                <div class="detail-header">
                    <h1 class="detail-title">
                        <a href="${perf.link}" target="_blank" rel="noopener noreferrer">${perf.title}</a>
                    </h1>
                    <div class="detail-meta">
                        <span><strong>${t("date")}:</strong> ${perf.date}</span>
                        <span><strong>${t("time")}:</strong> ${perf.time}</span>
                        <span><strong>${t("location")}:</strong> ${perf.venue}</span>
                    </div>
                </div>
                <div class="cast-container">
                    <div class="cast-title">${t("castLineup", { count: perf.castIds.length })}</div>
                    <div class="cast-grid">
                        ${castCardsHTML}
                    </div>
                </div>
            </div>
        `;
    });

    detailWrapper.innerHTML = contentHTML;
}

function clearActiveDay() {
    const activeDays = document.querySelectorAll(".timeline-day.active");
    activeDays.forEach(d => d.classList.remove("active"));
}

function toggleAccordion(bodyId, arrowId) {
    const body = document.getElementById(bodyId);
    const arrow = document.getElementById(arrowId);
    if (!body || !arrow) return;
    
    if (body.classList.contains("collapsed")) {
        body.classList.remove("collapsed");
        arrow.textContent = "▼";
    } else {
        body.classList.add("collapsed");
        arrow.textContent = "▶";
    }
}

// 특정 멤버 카드 클릭 시 프로필 세부사항 및 아코디언 바인딩
function selectMember(memberId, forceOpen = true) {
    const member = membersData.find(m => m.memberId === memberId);
    if (!member) return;

    const leftPanelContent = document.getElementById("left-panel-content");
    const personalSchedules = currentMonthPerformances.filter(p => p.castIds.includes(memberId));

    // A. 세부 프로필(details) 데이터 매핑용 HTML 테이블 빌드 [1]
    let detailsTableHTML = "";
    const d = member.details || member.detail; 
    
    if (d) {
        const labelMap = {
            "nickname": t("labelNickname"),
            "birthdate": t("labelBirthdate"),
            "bloodType": t("labelBloodType"),
            "hometown": t("labelHometown"),
            "height": t("labelHeight"),
            "memberColor": t("labelMemberColor"),
            "hobby": t("labelHobby"),
            "specialty": t("labelSpecialty")
        };

        detailsTableHTML += `<table class="profile-details-table">`;
        for (const [key, label] of Object.entries(labelMap)) {
            if (d[key]) {
                detailsTableHTML += `
                    <tr>
                        <td class="label-td">${label}</td>
                        <td>${d[key]}</td>
                    </tr>
                `;
            }
        }
        detailsTableHTML += `</table>`;
    } else {
        detailsTableHTML = `<div class="profile-placeholder" style="padding:10px;">No detailed info.</div>`;
    }

    // B. 개인 스케줄 HTML 빌드
    let personalScheduleHTML = "";
    if (personalSchedules.length > 0) {
        personalSchedules.forEach(schedule => {
            const rawCastNames = schedule.castIds.map(id => {
                const m = membersData.find(mem => mem.memberId === id);
                if (!m) return id; // 매핑 멤버가 없을 경우 이름 텍스트 그대로 목록에 보존
                return m.memberId === memberId 
                    ? `<span class="highlight-name">${m.name}</span>`
                    : m.name;
            }).filter(name => name).join(", ");

            personalScheduleHTML += `
                <div class="member-schedule-item">
                    <strong>${t("datetime")}:</strong> ${schedule.date} (${schedule.time})<br>
                    <strong>${t("performance")}:</strong> ${schedule.title}<br>
                    <strong>${t("cast")}:</strong> ${rawCastNames}
                </div>
            `;
        });
    } else {
        personalScheduleHTML = `<div class="profile-placeholder" style="padding:10px;">${t("noPersonalSchedule")}</div>`;
    }

    // C. 동적 콘텐츠 영역 교체
    leftPanelContent.innerHTML = `
        <div class="profile-card">
            <div class="profile-img-wrapper">
                <img src="${member.profileImageUrl}" alt="${member.name}" onerror="this.src='https://placehold.co/140x175/bfeae5/333333?text=${member.name}'">
            </div>
            <div class="profile-name">${member.name}</div>
            <div class="profile-team">${member.position}</div>
            <p class="profile-bio">${member.bio}</p>
        </div>
        
        <!-- 아코디언 1: 세부 정보 프로필 (기본값: 접힘 ▶) -->
        <div class="accordion-header" onclick="toggleAccordion('member-details-body', 'details-arrow-indicator')">
            <span>🔍 ${t("accordionDetail")}</span>
            <span class="arrow-indicator" id="details-arrow-indicator">▶</span>
        </div>
        <div id="member-details-body" class="accordion-content collapsed">
            ${detailsTableHTML}
        </div>

        <!-- 아코디언 2: 이번 달 스케줄 (기본값: 열림 ▼ - [요구사항 반영] 총 몇 개 출연하는지 count를 템플릿에 실시간 주입) [1] -->
        <div class="accordion-header" onclick="toggleAccordion('member-schedule-body', 'schedule-arrow-indicator')">
            <span>${t("personalSchedule", { month: viewMonth, count: personalSchedules.length })}</span>
            <span class="arrow-indicator" id="schedule-arrow-indicator">▼</span>
        </div>
        <div id="member-schedule-body" class="accordion-content">
            <div class="member-schedule-list">
                ${personalScheduleHTML}
            </div>
        </div>
    `;

    // D. 모바일 인터랙션 제어
    const leftPanel = document.getElementById("left-panel");
    const isDrawerOpen = leftPanel.classList.contains("drawer-active");
    
    if (forceOpen || isDrawerOpen) {
        leftPanel.classList.add("drawer-active");
        document.getElementById("drawer-overlay").classList.add("active");
    }
}

function showInitializationError(message) {
    document.getElementById("timeline-container").innerHTML = `<div class="loading-text" style="color:red; font-weight:bold;">${message}</div>`;
}

// 윈도우 로드 핸들러 연결
window.onload = function() {
    initApplication();
};