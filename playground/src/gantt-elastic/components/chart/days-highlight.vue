<template>
  <g
    class="gantt-elastic__chart-days-highlight-container"
    v-if="showWorkingDays"
  >
    <template v-for="day in workingDays" :key="getKey(day)">
      <rect
        class="gantt-elastic__chart-days-highlight-rect"
        v-if="day.width"
        :x="day.offset.px"
        y="0"
        :width="safe(day.width.px)"
        height="100%"
      />
    </template>
  </g>
</template>

<script>
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { safe } from '../../utils';

export default defineComponent({
  name: 'DaysHighlight',
  inject: ['root'],
  data() {
    return {};
  },
  setup() {
    return {
      safe
    }
  },
  methods: {
    /**
     * Get key
     *
     * @param {object} day
     * @returns {string} key ideintifier for loop
     */
    getKey(day) {
      return dayjs(day.time).format('YYYY-MM-DD');
    }
  },
  computed: {

    /**
     * Get working days
     *
     * @returns {array}
     */
    workingDays() {
      return this.root.state.options.times.steps.filter(step => {
        return this.root.state.options.calendar.workingDays.indexOf(dayjs(step.time).day()) === -1;
      });
    },

    /**
     * Show working days?
     *
     * @returns {bool}
     */
    showWorkingDays() {
      const calendar = this.root.state.options.calendar;
      if (
        typeof calendar.workingDays !== 'undefined' &&
        Array.isArray(calendar.workingDays) &&
        calendar.workingDays.length
      ) {
        return true;
      }
      return false;
    }
  }
});
</script>

<style lang="less">
.gantt-elastic__chart-days-highlight-rect {
  fill: #f3f5f780;
}
</style>
