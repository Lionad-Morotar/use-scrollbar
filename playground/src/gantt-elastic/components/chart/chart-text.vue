<template>
  <svg
    class="gantt-elastic__chart-row-text-wrapper"
    :x="x"
    :y="y"
    :width="getWidth"
    :height="height"
  >
    <foreignObject x="0" y="0" width="100%" :height="height">
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        class="gantt-elastic__chart-row-text"
      >
        <div
          class="gantt-elastic__chart-row-text-content"
        >
          {{ text || task.label }}
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
  props: ['task', 'position', 'text', 'size'],
  data() {
    return {};
  },
  computed: {
    x() {
      if (this.position) {
        return this.position.x + this.root.state.options.chart.text.offset;
      }
      return this.task.x + this.task.width + this.root.state.options.chart.text.offset;
    },
    y() {
      if (this.position) {
        return this.position.y;
      }
      return this.task.y - this.root.state.options.chart.grid.horizontal.gap;
    },

    /**
     * Get width
     *
     * @returns {number}
     */
    getWidth() {
      const safe = 24; // 2em
      const textWidth = this.root.state.ctx.measureText(this.text || this.task.label).width;
      return textWidth + this.root.state.options.chart.text.xPadding * 2 + safe;
    },

    /**
     * Get height
     *
     * @returns {number}
     */
    height() {
      if (this.size) {
        return this.size.height;
      }
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

  .gantt-elastic__chart-row-text-content {
    font-size: 12px;
    color: #000000a0;
  }
}
</style>