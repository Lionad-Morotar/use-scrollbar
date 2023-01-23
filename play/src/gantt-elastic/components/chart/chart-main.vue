<template>
  <div class="gantt-elastic__chart" ref="chart">
    <div
      class="gantt-elastic__chart-calendar-container"
      ref="chartCalendarContainer"
      :style="{
        height: root.state.options.calendar.height + 'px',
      }"
    >
      <calendar />
    </div>
    <div
      class="gantt-elastic__chart-graph-container"
      ref="chartGraphContainer"
    >
      <div
        class="gantt-elastic__chart-area"
        :style="{
          width: root.state.options.width + 'px',
          height: root.state.options.rowsHeight + 'px'
        }"
      >
        <div
          class="gantt-elastic__chart-graph"
          ref="chartGraph"
        >
          <svg
            class="gantt-elastic__chart-graph-svg"
            ref="chartGraphSvg"
            x="0"
            y="0"
            :width="safe(root.state.options.width) + 'px'"
            :height="safe(root.state.options.allVisibleTasksHeight) + 'px'"
            xmlns="http://www.w3.org/2000/svg"
          >
            <days-highlight></days-highlight>
            <grid></grid>
            <g
              class="gantt-elastic__chart-row-wrapper"
              v-for="task in root.visibleTasks"
              :task="task"
              :key="task.id"
            >
              <component :task="task" :is="task.type"></component>
            </g>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import Grid from './background-grid.vue';
import DaysHighlight from './days-highlight.vue';
import Calendar from '../calendar/calendar-wrapper.vue';
import Task from './row/row-task.vue';
import { safe } from "../../utils";

export default defineComponent({
  name: 'Chart',
  components: {
    Grid,
    Calendar,
    Task,
    DaysHighlight,
  },
  inject: ['root'],
  data() {
    return {
      moving: false
    };
  },
  /**
   * Mounted
   */
  mounted() {
    this.root.state.refs.chart = this.$refs.chart;
    this.root.state.refs.chartCalendarContainer = this.$refs.chartCalendarContainer;
    this.root.state.refs.chartGraphContainer = this.$refs.chartGraphContainer;
    this.root.state.refs.chartGraph = this.$refs.chartGraph;
    this.root.state.refs.chartGraphSvg = this.$refs.chartGraphSvg;
  },

  computed: {
    /**
     * Get view box
     *
     * @returns {string}
     */
    getViewBox() {
      return `0 0 ${this.root.state.options.width} ${this.root.state.options.allVisibleTasksHeight}`;
    }
  },

  methods: {
    safe,
  }
});
</script>

<style lang="less">
.gantt-elastic__chart {
  position: relative;
  display: grid;
  grid-template: auto minmax(0, 1fr) / 1fr;
  height: 100%;
  overflow: hidden;
}
.gantt-elastic__chart-graph-svg {
  min-width: 100%;;
}
.gantt-elastic__chart-calendar-container {
  max-width: 100%;
  height: 76px;
  border-right: 1px solid #eee;
  overflow: hidden;
  user-select: none;
}
.gantt-elastic__chart-graph-container {
  position: relative;
  max-width: 100%;
  height: auto;
  border-right: 1px solid #eee;
  overflow: hidden;
  user-select: none;
}
.gantt-elastic__chart-graph {
  overflow: hidden;
  height: 100%;
}
// ! 需要禁用，有些问题
// .gantt-elastic__chart-row-wrapper {
//   content-visibility: auto;
// }
</style>
