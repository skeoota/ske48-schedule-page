// i18n 번역 사전 (연도 접미사 및 월 이름 다국어 리소스 보강)
const translations = {
    ko: {
        title: "SKE48 극장 스케줄 & 프로필 포탈",
        monthLabel: "{year}년 {month}월",
        prevMonth: "이전 달",
        nextMonth: "다음 달",
        btnToday: "오늘",
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
        noCategoryPerformances: "선택한 카테고리의 일정이 없습니다.",

        accordionDetail: "세부 프로필 정보",
        labelNickname: "닉네임",
        labelBirthdate: "생년월일",
        labelBloodType: "혈액형",
        labelHometown: "출신지",
        labelHeight: "신장",
        labelMemberColor: "멤버 컬러",
        labelHobby: "취미",
        labelSpecialty: "특기",

        weekdays: ["일", "월", "화", "수", "목", "금", "토"],

        // 💡 [신규] 선택기 전용 다국어 리소스 [1]
        yearSuffix: "년",
        months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
    },
    ja: {
        title: "SKE48 劇場スケジュール＆プロフィールポータル",
        monthLabel: "{year}年 {month}月",
        prevMonth: "前月",
        nextMonth: "翌月",
        btnToday: "今日",
        tabSchedule: "劇場スケジュール",
        tabProfiles: "メンバープロフィール",
        teamCountLabel: "({count}人)",
        profilePlaceholder: "メンバーカード 또는 출연キャストを選択すると、<br>詳細プロフィール와 今月のスケジュール이 여기에 표시됩니다.",
        detailPlaceholder: "タイムラインから日付を選択すると、그날의 상세정보가 여기에 표시됩니다.",
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
        errLoadMembers: "data/members.json の読み込みに失敗しました。CORS制限 또는 경로를 확인해주세요.",
        errLoadSchedule: "スケジュールの読み込みに失敗しました（{year}年{month}月）",
        noCategoryPerformances: "選択されたカテゴリのスケジュールがありません。",

        accordionDetail: "詳細プロフィール",
        labelNickname: "ニックネーム",
        labelBirthdate: "生年月日",
        labelBloodType: "血液型",
        labelHometown: "出身地",
        labelHeight: "身長",
        labelMemberColor: "メンバーカラー",
        labelHobby: "趣味",
        labelSpecialty: "特技",

        weekdays: ["日", "月", "火", "水", "木", "金", "土"],

        yearSuffix: "年",
        months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    },
    en: {
        title: "SKE48 Theater Schedule & Profile Portal",
        monthLabel: "{year}-{month}",
        prevMonth: "Prev Month",
        nextMonth: "Next Month",
        btnToday: "Today",
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
        noCategoryPerformances: "No schedules found for the selected category.",

        accordionDetail: "Detailed Profile",
        labelNickname: "Nickname",
        labelBirthdate: "Birthdate",
        labelBloodType: "Blood Type",
        labelHometown: "Hometown",
        labelHeight: "Height",
        labelMemberColor: "Member Color",
        labelHobby: "Hobby",
        labelSpecialty: "Specialty",

        weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

        yearSuffix: " ",
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
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

// 카테고리 다국어 번역 사전
const categoryTranslations = {
    ko: {
        "公演": "극장 공연",
        "メディア": "미디어",
        "イベント": "이벤트",
        "その他": "기타",
        "기타": "기타",
        "all": "전체"
    },
    ja: {
        "公演": "公演",
        "メディア": "メディア",
        "イベント": "イベント",
        "その他": "その他",
        "기타": "その他",
        "all": "全て"
    },
    en: {
        "公演": "Show",
        "メディア": "Media",
        "イベント": "Event",
        "other": "Other",
        "기타": "Other",
        "all": "All"
    }
};

// 전역 상태 변수
let membersData = [];
let currentMonthPerformances = [];
let activeSelectedDay = null;
let activeViewMode = "schedule";
let activeCategoryFilter = "all";

// 오늘 날짜 데이터를 실시간으로 가져와 전역 설정합니다 [1].
const systemToday = new Date();
let viewYear = systemToday.getFullYear();
let viewMonth = systemToday.getMonth() + 1;

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

    // 좌측 패널에 활성화된 멤버가 있다면 탭 전환 시점의 모드에 맞추어 스케줄 목록을 새로 고쳐줍니다.
    const activeProfileCard = document.querySelector(".profile-card .profile-name");
    if (activeProfileCard) {
        const memberObj = membersData.find(m => m.name === activeProfileCard.textContent);
        if (memberObj) selectMember(memberObj.memberId, false);
    }
}

function updateStaticPlaceholders() {
    document.title = t("title");
    document.getElementById("btn-prev-month").textContent = `< ${t("prevMonth")}`;
    document.getElementById("btn-next-month").textContent = `${t("nextMonth")} >`;
    document.getElementById("btn-today").textContent = t("btnToday");
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

// 달력 데이터 취합 및 타임라인 생성 시 하루 복수 공연 개별 분할 렌더링 지원 [1]
async function loadTimeline(resetFilter = true) {
    const formattedMonth = String(viewMonth).padStart(2, '0');

    // 💡 [신규 고도화] 현재 조회 중인 연월 드롭다운 옵션들을 현지 다국어 리소스 기반으로 재생성 및 바인딩 [1]
    updateDateSelects();

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
        console.warn("스케줄 데이터 로드 실패:", error);
        currentMonthPerformances = [];
    }

    if (resetFilter) {
        activeCategoryFilter = "all";
    }

    renderTimeline();
}

// 필터 바를 동적으로 렌더링하는 함수
function renderFilterBar() {
    const filterBar = document.getElementById("timeline-filter-bar");
    if (!filterBar) return;

    // 현재 로드된 월의 모든 공연 데이터에서 고유 카테고리 추출 (null 또는 undefined 제외)
    const rawCategories = currentMonthPerformances.map(p => p.category || "기타");
    const categories = Array.from(new Set(rawCategories)).filter(c => c);

    // 카테고리 정렬 순서 정의 (공연 -> 미디어 -> 이벤트 -> 기타 순)
    const categoryOrder = ["公演", "メディア", "イベント", "기타"];
    categories.sort((a, b) => {
        const idxA = categoryOrder.indexOf(a);
        const idxB = categoryOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    const getCategoryLabel = (cat) => {
        if (categoryTranslations[currentLang] && categoryTranslations[currentLang][cat]) {
            return categoryTranslations[currentLang][cat];
        }
        return cat;
    };

    let filterHTML = `
        <button class="filter-pill ${activeCategoryFilter === 'all' ? 'active' : ''}" onclick="setCategoryFilter('all')">
            ${getCategoryLabel('all')}
        </button>
    `;

    categories.forEach(cat => {
        filterHTML += `
            <button class="filter-pill ${activeCategoryFilter === cat ? 'active' : ''}" onclick="setCategoryFilter('${cat}')">
                ${getCategoryLabel(cat)}
            </button>
        `;
    });

    filterBar.innerHTML = filterHTML;
}

// 카테고리 필터 선택 시 실행되는 함수
function setCategoryFilter(category) {
    activeCategoryFilter = category;
    renderTimeline();

    // 좌측 패널에 활성화된 멤버가 있다면 필터 변경에 맞추어 스케줄 목록을 새로 고쳐줍니다.
    const activeProfileCard = document.querySelector(".profile-card .profile-name");
    if (activeProfileCard) {
        const memberObj = membersData.find(m => m.name === activeProfileCard.textContent);
        if (memberObj) selectMember(memberObj.memberId, false);
    }
}

// 타임라인 그리기 함수
function renderTimeline() {
    renderFilterBar();

    const timelineContainer = document.getElementById("timeline-container");
    timelineContainer.innerHTML = "";

    const formattedMonth = String(viewMonth).padStart(2, '0');
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

    // 카테고리 필터링 적용
    let filteredPerformances = currentMonthPerformances;
    if (activeCategoryFilter !== "all") {
        filteredPerformances = currentMonthPerformances.filter(p => (p.category || "기타") === activeCategoryFilter);
    }

    let hasAnyPerformance = filteredPerformances.length > 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${viewYear}-${formattedMonth}-${String(day).padStart(2, '0')}`;

        // 하루에 등록된 공연 중 필터 조건에 부합하는 공연들 수집
        const dayPerfs = filteredPerformances.filter(p => p.date === dateStr);

        // 필터가 'all'이 아니며 해당 날짜에 부합하는 공연이 한 건도 없는 경우 날짜 자체를 타임라인에서 생략합니다.
        if (activeCategoryFilter !== "all" && dayPerfs.length === 0) {
            continue;
        }

        // 요일 연산 적용
        const dateObj = new Date(viewYear, viewMonth - 1, day);
        const dayOfWeek = dateObj.getDay(); // 0(일) ~ 6(토)
        const weekdayName = t("weekdays")[dayOfWeek];
        const dayClass = dayOfWeek === 6 ? "sat" : (dayOfWeek === 0 ? "sun" : "");

        const dayDiv = document.createElement("div");
        dayDiv.className = "timeline-day";
        dayDiv.id = `day-container-${day}`;

        const isToday = viewYear === systemToday.getFullYear() && viewMonth === (systemToday.getMonth() + 1) && day === systemToday.getDate();
        if (isToday) {
            dayDiv.classList.add("today-highlight");
        }

        // 들여쓰기 구조를 완벽히 통일시킵니다.
        let contentHTML = `
            <div class="day-num ${dayClass}">${day}<span class="weekday">(${weekdayName})</span></div>
            <div class="day-content">
        `;

        if (dayPerfs.length > 0) {
            // 한 날짜의 여러 스케줄을 순서대로 생성
            dayPerfs.forEach((perf, idx) => {
                const castNames = perf.castIds.map(id => {
                    const m = membersData.find(mem => mem.memberId === id);
                    return m ? m.name : id;
                }).filter(name => name).join(", ");

                contentHTML += `
                    <div class="perf-item-link" id="perf-link-${day}-${idx}" onclick="handlePerfClick('${day}-${idx}', '${perf.performanceId}', this)">
                        <div class="day-title" style="color: #00796b;">
                            <span class="category-badge">${perf.category || "기타"}</span> [${perf.time}] ${perf.title}
                        </div>
                        <div class="day-cast-summary">${castNames}</div>
                    </div>
                `;
            });
        } else {
            // 필터가 'all'이면서 일정이 없는 날 (기본 빈 카드를 보여줌)
            contentHTML += `
                <div class="perf-item-link empty" id="perf-link-${day}-0" onclick="handleEmptyClick('${day}-0', '${dateStr}', this)">
                    <div class="day-title" style="color: #bbb; font-weight: normal;">${t("noPerformance")}</div>
                    <div class="day-cast-summary">-</div>
                </div>
            `;
        }

        contentHTML += `</div>`;
        dayDiv.innerHTML = contentHTML;
        timelineContainer.appendChild(dayDiv);
    }

    // 만약 필터 결과 일치하는 일정이 없으면 예쁜 결과 없음 메시지를 띄웁니다.
    if (activeCategoryFilter !== "all" && !hasAnyPerformance) {
        timelineContainer.innerHTML = `
            <div class="no-filter-results">
                ${t("noCategoryPerformances")}
            </div>
        `;
    }

    // 필터링 적용 후, 자동으로 클릭 및 포커싱할 타겟 설정
    setTimeout(() => {
        const firstElement = timelineContainer.querySelector(".perf-item-link");
        if (firstElement) {
            let clickTarget = null;
            if (viewYear === systemToday.getFullYear() && viewMonth === (systemToday.getMonth() + 1)) {
                const todayDay = systemToday.getDate();
                const todayLinks = timelineContainer.querySelectorAll(`.perf-item-link[id^="perf-link-${todayDay}-"]`);
                const validTodayLink = Array.from(todayLinks).find(el => !el.classList.contains("empty"));
                if (validTodayLink) {
                    clickTarget = validTodayLink;
                } else if (todayLinks.length > 0) {
                    clickTarget = todayLinks[0];
                }
            }

            if (!clickTarget) {
                clickTarget = firstElement;
            }

            if (clickTarget) {
                clickTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                clickTarget.click();
            }
        } else {
            // 클릭할 요소가 아예 없으면 우측 상세창을 비워둡니다.
            const detailWrapper = document.getElementById("detail-wrapper");
            if (detailWrapper) {
                detailWrapper.innerHTML = `<div class="profile-placeholder"><p>${t("detailPlaceholder")}</p></div>`;
            }
        }
    }, 100);
}

// 💡 [신규 고도화] 연/월 개별 드롭다운 셀렉터를 다국어 사전에 맞게 생성하고 바인딩하는 함수 [1]
function updateDateSelects() {
    const yearSelect = document.getElementById("year-select");
    const monthSelect = document.getElementById("month-select");
    if (!yearSelect || !monthSelect) return;

    // 기존 내용 지우기
    yearSelect.innerHTML = "";
    monthSelect.innerHTML = "";

    // A. 연도 드롭다운 (2024년부터 내년도까지 동적 바인딩)
    const startYear = 2024;
    const endYear = (new Date()).getFullYear() + 1;
    const suffix = t("yearSuffix");

    for (let y = startYear; y <= endYear; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = `${y}${suffix}`;
        if (y === viewYear) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    // B. 월 드롭다운 (다국어에 보관된 고유 로컬 월 표기 적용) [1]
    const monthNames = t("months");
    for (let m = 1; m <= 12; m++) {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = monthNames[m - 1];
        if (m === viewMonth) opt.selected = true;
        monthSelect.appendChild(opt);
    }
}

// 💡 [신규 고도화] 수동으로 연도나 월 드롭다운을 변경했을 때의 감지 이벤트 헨들러 [1]
async function handleSelectDateChange() {
    const yearSelect = document.getElementById("year-select");
    const monthSelect = document.getElementById("month-select");
    if (!yearSelect || !monthSelect) return;

    viewYear = parseInt(yearSelect.value, 10);
    viewMonth = parseInt(monthSelect.value, 10);

    await loadTimeline();
}

// 언제든 실제 오늘 연월일 일정으로 귀환하는 함수
async function goToToday() {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth() + 1;

    // 타임라인을 새로 빌딩하면 내부의 오토포커싱 루틴에 의해 오늘의 첫 일정을 자동 타겟팅 및 클릭하게 됩니다.
    await loadTimeline();
}

// 개별 스케줄을 클릭했을 때의 통합 인터랙션 함수
function handlePerfClick(selectedKey, perfId, element) {
    const perf = currentMonthPerformances.find(p => p.performanceId === perfId);
    if (!perf) return;

    activeSelectedDay = selectedKey;

    // 타임라인 전반의 모든 액티브 효과 제거 및 타겟 요소에만 액티브 마킹
    document.querySelectorAll(".perf-item-link").forEach(el => el.classList.remove("active"));
    element.classList.add("active");

    selectPerformance(perf);
}

// 일정이 없는 날을 클릭했을 때의 통합 인터랙션 함수
function handleEmptyClick(selectedKey, dateStr, element) {
    activeSelectedDay = selectedKey;

    document.querySelectorAll(".perf-item-link").forEach(el => el.classList.remove("active"));
    element.classList.add("active");

    selectEmptyDay(dateStr);
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
    await loadTimeline(false);

    // 개별 복수 일정 전환 보존을 위해 `perf-link-` ID를 추적하도록 매핑을 보완합니다.
    if (activeSelectedDay && activeViewMode === "schedule") {
        const currentElement = document.getElementById(`perf-link-${activeSelectedDay}`);
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

function selectEmptyDay(dateStr) {
    const detailWrapper = document.getElementById("detail-wrapper");
    detailWrapper.innerHTML = `
        <div class="detail-header">
            <h3 class="detail-title">${dateStr}</h3>
            <div class="detail-meta"><span>${t("noPerformanceDetail")}</span></div>
        </div>
    `;
}

// 개별 스케줄 단일 건(perf)을 받아서 상세 바인딩 처리합니다.
function selectPerformance(perf) {
    const detailWrapper = document.getElementById("detail-wrapper");
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

    detailWrapper.innerHTML = `
        <div class="perf-detail-block">
            <div class="detail-header">
                <div style="margin-bottom: 8px;">
                    <span class="category-badge" style="font-size: 11px; padding: 3px 8px;">${perf.category || "기타"}</span>
                </div>
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
}

// 특정 멤버 카드 클릭 시 프로필 세부사항 및 아코디언 바인딩
function selectMember(memberId, forceOpen = true) {
    const member = membersData.find(m => m.memberId === memberId);
    if (!member) return;

    const leftPanelContent = document.getElementById("left-panel-content");

    // activeViewMode === "schedule" 이고 카테고리 필터가 "all"이 아닌 경우에만 개인 일정을 필터링합니다.
    let personalSchedules = currentMonthPerformances.filter(p => p.castIds.includes(memberId));
    if (activeViewMode === "schedule" && activeCategoryFilter !== "all") {
        personalSchedules = personalSchedules.filter(p => (p.category || "기타") === activeCategoryFilter);
    }

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

    let personalScheduleHTML = "";
    if (personalSchedules.length > 0) {
        personalSchedules.forEach(schedule => {
            const rawCastNames = schedule.castIds.map(id => {
                const m = membersData.find(mem => mem.memberId === id);
                if (!m) return id;
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

        <!-- 아코디언 2: 이번 달 스케줄 (기본값: 열림 ▼) -->
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

window.onload = function () {
    initApplication();
};
