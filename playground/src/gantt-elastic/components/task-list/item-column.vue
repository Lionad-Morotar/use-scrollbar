<template>
  <div class="gantt-elastic__task-list-item-column" :style="{
        width: this.column.finalWidth + 'px',
        height: this.column.height + 'px'
      }">
    <div class="gantt-elastic__task-list-item-value-wrapper">
      <slot></slot>
      <!-- TODO popover -->
      <div class="gantt-elastic__task-list-item-value">
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ItemColumn',
  inject: ['root'],
  props: ['column', 'task'],
  data() {
    return {};
  },
  methods: {
  },
  computed: {
    /**
     * Get column value
     *
     * @returns {any|string}
     */
    value() {
      if (typeof this.column.value === 'function') {
        return this.column.value(this.task);
      }
      return this.task[this.column.value];
    }
  }
});
</script>

<style lang="less">
.gantt-elastic__task-list-item-column {
  display: inline-flex;
  flex-shrink: 0;
  border-left: 1px solid #eee;
}
.gantt-elastic__task-list-item-value-wrapper {
  display: inline-flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &:hover {
    overflow: visible;

    & > .gantt-elastic__task-list-item-value {
      width: auto;
      background: white;
      overflow: visible;
      z-index: 1;
    }
  }
}
.gantt-elastic__task-list-item-value {
  margin: 0 6px;
  width: 100%;
  color: rgb(96, 96, 96);
  word-break: keep-all;
  white-space: nowrap;
  font-size: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
