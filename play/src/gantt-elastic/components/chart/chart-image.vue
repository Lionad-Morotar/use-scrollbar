<template>
  <svg
    class="gantt-elastic__chart-row-text-wrapper"
    :x="task.x + task.width + root.state.options.chart.text.offset"
    :y="task.y - root.state.options.chart.grid.horizontal.gap"
    :width="getWidth"
    :height="getHeight"
  >
    <foreignObject x="0" y="0" width="100%" :height="getHeight">
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        class="gantt-elastic__chart-row-text"
      >
        <div
          class="gantt-elastic__chart-row-text-content"
        >
          <div>{{ task.label }}</div>
        </div>
      </div>
    </foreignObject>
  </svg>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ChartText',
  inject: ['root'],
  props: ['task'],
  data() {
    return {};
  },
  computed: {
    /**
     * Get width
     *
     * @returns {number}
     */
    getWidth() {
      const textWidth = this.root.state.ctx.measureText(this.task.label).width;
      return textWidth + this.root.state.options.chart.text.xPadding * 2;
    },

    /**
     * Get height
     *
     * @returns {number}
     */
    getHeight() {
      return this.task.height + this.root.state.options.chart.grid.horizontal.gap * 2;
    },
  }
});
</script>

<style lang="less">
.gantt-elastic__chart-row-text {
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  height: 100%;
  background: #ffffffa0;
  font-size: 12px;
  color: #000000a0;
}
</style>