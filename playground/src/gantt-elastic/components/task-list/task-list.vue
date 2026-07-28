<template>
  <div
    class="gantt-elastic__task-list-wrapper"
    ref="taskListWrapper"
    v-show="root.state.options.taskList.display"
  >
    <div class="gantt-elastic__task-list" ref="taskList">
      <task-list-header />
      <div
        class="gantt-elastic__task-list-items"
        ref="taskListItems"
      >
        <task-list-item v-for="task in root.visibleTasks" :key="task.id" :task="task"></task-list-item>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import TaskListHeader from './task-list-header.vue';
import TaskListItem from './task-list-item.vue';

export default defineComponent({
  name: 'TaskList',
  components: {
    TaskListHeader,
    TaskListItem
  },
  inject: ['root'],
  data() {
    return {};
  },

  /**
   * Mounted
   */
  mounted() {
    this.root.state.refs.taskListWrapper = this.$refs.taskListWrapper;
    this.root.state.refs.taskList = this.$refs.taskList;
    this.root.state.refs.taskListItems = this.$refs.taskListItems;
  }
});
</script>

<style lang="less">
.gantt-elastic__task-list-wrapper {
  width: 100%;
  height: 100%;
}
.gantt-elastic__task-list {
  background: transparent;
  border-color: #eee;
}
.gantt-elastic__task-list-items {
  height: auto;
  overflow: hidden;
}
.gantt-elastic__task-list-item {
  content-visibility: auto;
}
</style>
