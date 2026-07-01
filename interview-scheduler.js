const candidateName = "Анастасия";
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const state = {
      selectedDate: null,
      selectedSlot: null
    };

    const dayGrid = document.querySelector("#dayGrid");
    const slotList = document.querySelector("#slotList");
    const rangeLabel = document.querySelector("#rangeLabel");
    const confirmationSection = document.querySelector("#confirmationSection");
    const selectedText = document.querySelector("#selectedText");
    const summaryDate = document.querySelector("#summaryDate");
    const summaryTime = document.querySelector("#summaryTime");
    const stepDate = document.querySelector("#stepDate");
    const stepTime = document.querySelector("#stepTime");
    const stepConfirm = document.querySelector("#stepConfirm");
    const successMessage = document.querySelector("#successMessage");
    const successText = document.querySelector("#successText");

    function pad(value) {
      return String(value).padStart(2, "0");
    }

    function toKey(date) {
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    function addDays(date, days) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
    }

    function getSlotsForDate(date, index) {
      const weekday = date.getDay();
      if (weekday === 0) return [];
      if (weekday === 6) return index < 4 ? ["11:00"] : [];
      const variants = [
        ["10:00", "12:30", "16:00"],
        ["09:30", "15:30"],
        ["10:30"],
        ["11:00", "14:00", "16:30"]
      ];
      return variants[index % variants.length];
    }

    const days = Array.from({ length: 12 }, (_, index) => {
      const date = addDays(currentDate, index);
      return {
        date,
        key: toKey(date),
        slots: getSlotsForDate(date, index)
      };
    }).filter((day) => day.slots.length > 0);

    function formatFullDate(key) {
      const [year, month, day] = key.split("-").map(Number);
      return new Intl.DateTimeFormat("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(year, month - 1, day));
    }

    function formatDay(date) {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short"
      }).format(date).replace(".", "");
    }

    function formatWeekday(date) {
      return new Intl.DateTimeFormat("ru-RU", {
        weekday: "short"
      }).format(date).replace(".", "");
    }

    function slotLabel(count) {
      const lastTwo = count % 100;
      const last = count % 10;
      if (lastTwo >= 11 && lastTwo <= 14) return `${count} слотов`;
      if (last === 1) return `${count} слот`;
      if (last >= 2 && last <= 4) return `${count} слота`;
      return `${count} слотов`;
    }

    function updateSteps() {
      stepDate.classList.toggle("active", !state.selectedDate);
      stepTime.classList.toggle("active", Boolean(state.selectedDate) && !state.selectedSlot);
      stepConfirm.classList.toggle("active", Boolean(state.selectedDate && state.selectedSlot));
    }

    function renderDays() {
      dayGrid.innerHTML = "";
      const first = days[0].date;
      const last = days[days.length - 1].date;
      rangeLabel.textContent = `${formatDay(first)} - ${formatDay(last)}`;

      days.forEach((day, index) => {
        const button = document.createElement("button");
        button.className = "day";
        button.type = "button";
        button.classList.toggle("selected", state.selectedDate === day.key);
        button.classList.toggle("today", index === 0);
        button.setAttribute("aria-label", `${formatFullDate(day.key)}, ${slotLabel(day.slots.length)}`);
        button.innerHTML = `
          <span class="weekday">${index === 0 ? "Сегодня" : formatWeekday(day.date)}</span>
          <strong>${formatDay(day.date)}</strong>
          <small>${slotLabel(day.slots.length)}</small>
        `;
        button.addEventListener("click", () => {
          state.selectedDate = day.key;
          state.selectedSlot = null;
          successMessage.classList.remove("visible");
          renderDays();
          renderSlots();
          renderSummary();
          updateSteps();
        });
        dayGrid.appendChild(button);
      });
    }

    function renderSlots() {
      slotList.innerHTML = "";

      if (!state.selectedDate) {
        slotList.innerHTML = `<button class="slot" type="button" disabled><span>Выберите день</span><span class="meta">сначала</span></button>`;
        confirmationSection.classList.remove("visible");
        return;
      }

      const day = days.find((item) => item.key === state.selectedDate);
      day.slots.forEach((time) => {
        const button = document.createElement("button");
        button.className = "slot";
        button.type = "button";
        button.innerHTML = `<span>${time}</span><span class="meta">45 мин</span>`;
        button.classList.toggle("selected", state.selectedSlot === time);
        button.addEventListener("click", () => {
          state.selectedSlot = time;
          successMessage.classList.remove("visible");
          renderSlots();
          renderSummary();
          updateSteps();
          confirmationSection.classList.add("visible");
          confirmationSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        slotList.appendChild(button);
      });
    }

    function renderSummary() {
      const dateText = state.selectedDate ? formatFullDate(state.selectedDate) : "День пока не выбран";
      const timeText = state.selectedSlot ? `${state.selectedSlot} по Москве` : "Время пока не выбрано";
      summaryDate.textContent = dateText;
      summaryTime.textContent = timeText;
      selectedText.textContent = state.selectedDate && state.selectedSlot
        ? `${dateText}, ${state.selectedSlot}`
        : "Выберите день и время";
    }

    document.querySelector("#confirmBtn").addEventListener("click", () => {
      if (!state.selectedDate || !state.selectedSlot) return;
      successText.textContent = `${candidateName}, спасибо!\nЗапись подтверждена: ${formatFullDate(state.selectedDate)}, ${state.selectedSlot}.\nБудем ждать вас на интервью (˶ᵔ ᵕ ᵔ˶)\nУ нас самые лучшие на свете рекрутеры и мы гарантируем самое великолепное собеседование в вашей жизни ☀️🤗✨`;
      successMessage.classList.add("visible");
    });

    renderDays();
    renderSlots();
    renderSummary();
    updateSteps();
    lucide.createIcons({ attrs: { width: 19, height: 19, "stroke-width": 2.2 } });

