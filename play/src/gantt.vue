<template>
  <div class="play-container" ref="playRef">
    <div class="header">
      <h4>## GanttElastic with Virtual Scrollbars</h4>
      <h5><a href="https://neuronet.io/gantt-elastic/#/">原版链接</a></h5>
    </div>
    <gantt-elastic v-if="states.tasks?.length" :tasks="states.tasks" :options="options">
      <svg class="hidden">
        <defs>
          <pattern
            id="pattern-progress"
            width="20"
            height="20"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="20"
              class="chart-row-progress-bar-line"
              style="stroke: rgba(255, 255, 255, 0.145); stroke-width: 20"
            ></line>
          </pattern>
        </defs>
      </svg>
    </gantt-elastic>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import dayjs from 'dayjs';
import GanttElastic from "./gantt-elastic/index.vue";
import { isEmptyOrFallback } from "./gantt-elastic/utils";

const playRef = ref();

const options = {
  taskList: {
    columns: [
      {
        id: 1,
        label: "任务标题",
        value: "title",
        width: 350,
        expander: true,
      },
      {
        id: 2,
        label: "任务分类",
        value: "group",
        width: 80,
      },
      {
        id: 3,
        label: "编号",
        value: "code",
        width: 80,
      },
    ],
  },
}

const states = reactive({
  isLoading: false,
  tasks: [] as any[],
})

const refresh = async () => {
  function time(s: string | null, offset: number = 0) {
    const raw = dayjs(isEmptyOrFallback(s) ? new Date() : s);
    const res = raw.add(offset, "ms").valueOf();
    return res;
  }
  states.isLoading = true
  states.tasks = []
  setTimeout(() => {
    const itemCount = 300
    let parentId = 0
    states.tasks = Array(itemCount).fill(0).map((x, idx) => {
      return {
        id: idx,
        title: '任务名称' + idx,
        label: '任务名称' + idx,
        group: 'Group' + idx,
        code: '8d910dl3bd821d',
        start: time(null, ~~(Math.random() * -50) * 3600 * 24 * 1000),
        end: time(null, ~~(Math.random() * 10) * 3600 * 24 * 1000),
        type: "task",
        collapsed: true,
        progress: 100,
      }
    })
    states.isLoading = false
  }, 300)
}

onMounted(refresh)
</script>
