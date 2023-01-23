<template>
  <svg
    class="gantt-elastic__grid-lines-wrapper"
    ref="chart"
    x="0"
    y="0"
    :width="safe(root.state.options.width)"
    :height="safe(root.state.options.allVisibleTasksHeight)"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g class="gantt-elastic__grid-lines">
      <line
        class="gantt-elastic__grid-line-horizontal"
        v-for="line in horizontalLines"
        :key="line.key"
        :x1="safe(line.x1)"
        :y1="safe(line.y1)"
        :x2="safe(line.x2)"
        :y2="safe(line.y2)"
      />
      <line
        class="gantt-elastic__grid-line-vertical"
        v-for="line in verticalLines"
        :key="line.key"
        :x1="safe(line.x1)"
        :y1="safe(line.y1)"
        :x2="safe(line.x2)"
        :y2="safe(line.y2)"
      />
      <!-- TODO 动态改变当前时间线的位置 -->
      <line
        class="gantt-elastic__grid-line-time"
        :x1="safe(timeLinePosition.x)"
        :y1="safe(timeLinePosition.y1)"
        :x2="safe(timeLinePosition.x)"
        :y2="safe(timeLinePosition.y2)"
      />
    </g>
  </svg>
</template>

<script>
import { defineComponent } from 'vue';
import { emitter } from '../../events';
import { safe } from '../../utils';

export default defineComponent({
  name: 'Grid',
  inject: ['root'],
  data() {
    return {};
  },
  setup() {
    return {
      safe
    }
  },
  /**
   * Created
   */
  created() {
    emitter.on('recenterPosition', this.recenterPosition);
  },

  /**
   * Mounted
   */
  mounted() {
    this.$nextTick(() => {
      this.$nextTick(() => {
        // because of stupid slider :/
        this.root.scrollToTime(this.timeLinePosition.time);
      });
    });
  },

  methods: {
    /**
     * Recenter position - go to current time line
     */
    recenterPosition() {
      this.root.scrollToTime(this.timeLinePosition.time);
    }
  },

  computed: {
    /**
     * Generate vertical lines of the grid
     *
     * @returns {array}
     */
    verticalLines() {
      let lines = [];
      const state = this.root.state;
      state.options.times.steps.forEach(step => {
        if (this.root.isInsideViewPort(step.offset.px, 1)) {
          lines.push({
            key: step.time,
            x1: step.offset.px,
            y1: 0,
            x2: step.offset.px,
            y2:
              state.tasks.length * (state.options.row.height + state.options.chart.grid.horizontal.gap * 2) + 1
          });
        }
      });
      return lines;
    },

    /**
     * Generate horizontal lines of the grid
     *
     * @returns {array}
     */
    horizontalLines() {
      let lines = [];
      const state = this.root.state.options;
      let tasks = this.root.visibleTasks;
      for (let index = 0, len = tasks.length; index <= len; index++) {
        const y =
          index * (state.row.height + state.chart.grid.horizontal.gap * 2) + 1 / 2;
        lines.push({
          key: 'hl' + index,
          x1: 0,
          y1: y,
          x2: '100%',
          y2: y
        });
      }
      return lines;
    },

    /**
     * Check if specified line is inside viewport (visible)
     *
     * @returns {function}
     */
    inViewPort() {
      return line => {
        const state = this.root.state.options;
        return line.x1 >= state.scroll.chart.left && line.x1 <= state.scroll.chart.right;
      };
    },

    /**
     * Get current time line position
     *
     * @returns {object}
     */
    timeLinePosition() {
      const d = new Date();
      const current = d.getTime();
      const currentOffset = this.root.timeToPixelOffsetX(current);
      const timeLine = {
        x: 0,
        y1: 0,
        y2: '100%',
        dateTime: '',
        time: current
      };
      timeLine.x = currentOffset;
      timeLine.dateTime = d.toLocaleDateString();
      return timeLine;
    }
  }
});
</script>

<style lang="less">
.gantt-elastic__grid-lines {
  stroke: #f3f3f3;
  stroke-width: 1;
}
.gantt-elastic__grid-line-time {
  stroke: rgba(255, 0, 0, 0.38);
  stroke-width: 2px;
  stroke-dasharray: 3;
}
</style>
