<template>
  <div class="gantt-elastic__task-list-header" >
    <div
      class="gantt-elastic__task-list-header-column"
      :style="{
        ...getStyle(column)
      }"
      v-for="column in root.getTaskListColumns"
      :key="column._id"
    >
      <task-list-expander
        v-if="column.expander"
        :tasks="collapsible"
        :options="root.state.options.taskList.expander"
      ></task-list-expander>
      <div
        class="gantt-elastic__task-list-header-label gantt-elastic__calendar-row-text"
        :column="column"
        @mouseup="resizerMouseUp"
      >
        {{ column.label }}
      </div>
      <div
        class="gantt-elastic__task-list-header-resizer"
        :column="column"
        @mousedown="resizerMouseDown($event, column)"
      >
        <div class="gantt-elastic__task-list-header-resizer-dot" />
        <div class="gantt-elastic__task-list-header-resizer-dot" />
        <div class="gantt-elastic__task-list-header-resizer-dot" />
        <div class="gantt-elastic__task-list-header-resizer-dot" />
        <div class="gantt-elastic__task-list-header-resizer-dot" />
        <div class="gantt-elastic__task-list-header-resizer-dot" />
        <div class="gantt-elastic__task-list-header-resizer-dot" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import TaskListExpander from '../expander.vue';
import { emitter } from '../../events';

export default defineComponent({
  name: 'TaskListHeader',
  components: {
    TaskListExpander
  },
  inject: ['root'],
  data() {
    return {
      resizer: {
        moving: false,
        x: 0
      }
    };
  },
  computed: {
    /**
     * Is this row collapsible?
     *
     * @returns {bool}
     */
    collapsible() {
      return this.root.state.tasks.filter(task => task.allChildren.length > 0);
    }
  },
  methods: {
    /**
     * Get style
     *
     * @returns {object}
     */
    getStyle(column) {
      return {
        width: column.finalWidth + 'px'
      };
    },
    /**
     * Resizer mouse down event handler
     */
    resizerMouseDown(event, column) {
      if (!this.resizer.moving) {
        this.resizer.moving = column;
        this.resizer.x = event.clientX;
        this.resizer.initialWidth = column.width;
        emitter.emit('taskList-column-width-change-start', this.resizer.moving);
      }
    },

    /**
     * Resizer mouse move event handler
     */
    resizerMouseMove(event) {
      if (this.resizer.moving) {
        const lastWidth = this.resizer.moving.width;
        this.resizer.moving.width = this.resizer.initialWidth + event.clientX - this.resizer.x;
        if (this.resizer.moving.width < this.root.state.options.taskList.minWidth) {
          this.resizer.moving.width = this.root.state.options.taskList.minWidth;
        }
        if (lastWidth !== this.resizer.moving.width) {
          emitter.emit('taskList-column-width-change', this.resizer.moving);
        }
      }
    },

    /**
     * Resizer mouse up event handler
     */
    resizerMouseUp(event) {
      if (this.resizer.moving) {
        emitter.emit('taskList-column-width-change-stop', this.resizer.moving);
        this.resizer.moving = false;
      }
    }
  },
  /**
   * Created
   */
  created() {
    this.mouseUpListener = document.addEventListener('mouseup', this.resizerMouseUp.bind(this));
    this.mouseMoveListener = document.addEventListener('mousemove', this.resizerMouseMove.bind(this));
    emitter.on('main-view-mousemove', this.resizerMouseMove);
    emitter.on('main-view-mouseup', this.resizerMouseUp);
  },
  /**
   * Before destroy event - clear all event listeners
   */
  beforeDestroy() {
    document.removeEventListener('mouseup', this.resizerMouseUp);
    document.removeEventListener('mousemove', this.resizerMouseMove);
  }
});
</script>

<style lang="less">
.gantt-elastic__task-list-header {
  display: flex;
  user-select: none;
  vertical-align: middle;
  border-bottom: 1px solid #eee;
  border-left: 1px solid #eee;
}
.gantt-elastic__task-list-header-column {
  display: flex;
  background: #f3f5f7;
  border-left: 1px solid #00000050;
  border-color: transparent;

  &:last-of-type {
    border-right: 1px solid #00000050;
  }
}
.gantt-elastic__task-list-header-label {
  flex-grow: 1;
  flex-shrink: 0;
  margin: auto 6px;
  text-overflow: ellipsis;
  vertical-align: middle;
  overflow: hidden;
}
.gantt-elastic__task-list-header-resizer {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 0px 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
}
.gantt-elastic__task-list-header-resizer-dot {
  width: 3px;
  height: 3px;
  background: #ddd;
  border-radius: 100%;
}
</style>
