import type { Dayjs } from 'dayjs'

export function getDefaultOptions() {
  return {
    slots: {
      header: {},
    },
    width: 0,
    height: 0,
    clientWidth: 0,
    outerHeight: 0,
    rowsHeight: 0,
    allVisibleTasksHeight: 0,
    scroll: {
      scrolling: false,
      dragXMoveMultiplier: 3,
      dragYMoveMultiplier: 2,
      top: 0,
      taskList: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      chart: {
        left: 0,
        right: 0,
        percent: 0,
        timePercent: 0,
        top: 0,
        bottom: 0,
        time: 0,
        timeCenter: 0,
        dateTime: {
          left: "",
          right: "",
        },
      },
    },
    scope: {
      before: 1,
      after: 1,
    },
    times: {
      timeScale: 60 * 1000,
      timeZoom: 17,
      timePerPixel: 0,
      firstTime: null,
      lastTime: null,
      firstTaskTime: 0,
      lastTaskTime: 0,
      totalViewDurationMs: 0,
      totalViewDurationPx: 0,
      stepDuration: "day",
      steps: [],
    },
    row: {
      height: 29,
    },
    maxRows: 999,
    maxHeight: 0,
    chart: {
      task: {
        label: {
          display: true,
        },
      },
      grid: {
        horizontal: {
          gap: 6,
        },
      },
      progress: {
        width: 20,
        height: 6,
        pattern: true,
        bar: false,
      },
      text: {
        offset: 4,
        xPadding: 10,
        display: true,
      },
      prefix: {
        offset: 6,
      },
    },
    taskList: {
      display: true,
      resizeAfterThreshold: true,
      widthThreshold: 75,
      columns: [
       
        {
          id: 0,
          label: "ID",
          value: "id",
          width: 40,
        },
      ],
      percent: 100,
      width: 0,
      finalWidth: 0,
      widthFromPercentage: 0,
      minWidth: 18,
      expander: {
        type: "task-list",
        size: 16,
        columnWidth: 24,
        padding: 16,
        margin: 10,
        straight: false,
      },
    },
    calendar: {
      workingDays: [1, 2, 3, 4, 5],
      height: 0,
      strokeWidth: 1,
      hour: {
        height: 20,
        display: false,
        widths: [],
        maxWidths: { short: 0, medium: 0, long: 0 },
        formatted: {
          long: [],
          medium: [],
          short: [],
        },
        format: {
          long(date: Dayjs) {
            return date.format("HH:mm");
          },
          medium(date: Dayjs) {
            return date.format("HH:mm");
          },
          short(date: Dayjs) {
            return date.format("HH");
          },
        },
      },
      day: {
        height: 40,
        display: true,
        widths: [],
        maxWidths: { short: 0, medium: 0, long: 0 },
        format: {
          long(date: Dayjs) {
            return date.format("DD dddd");
          },
          medium(date: Dayjs) {
            return date.format("DD ddd");
          },
          short(date: Dayjs) {
            return date.format("DD");
          },
        },
      },
      month: {
        height: 36,
        display: true,
        widths: [],
        maxWidths: { short: 0, medium: 0, long: 0 },
        format: {
          short(date: Dayjs) {
            return date.format("MM");
          },
          medium(date: Dayjs) {
            return date.format("MMM 'YY");
          },
          long(date: Dayjs) {
            return date.format("MMMM YYYY");
          },
        },
      },
    },
    locale: {
      name: "zh-cn",
      weekdays: "周一_周二_周三_周四_周五_周六_周日".split("_"),
      weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
      weekdaysMin: "一_二_三_四_五_六_日".split("_"),
      months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十月_十二月".split("_"),
      monthsShort: "1_2_3_4_5_6_7_8_9_10_11_12".split("_"),
      weekStart: 1,
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "a few seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years",
      },
      formats: {
        LT: "HH:mm",
        LTS: "HH:mm:ss",
        L: "DD/MM/YYYY",
        LL: "D MMMM YYYY",
        LLL: "D MMMM YYYY HH:mm",
        LLLL: "dddd, D MMMM YYYY HH:mm",
      },
      ordinal: (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return `[${n}${s[(v - 20) % 10] || s[v] || s[0]}]`;
      },
    },
  };
}
