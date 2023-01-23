<template>
  <g
    v-if="isSafeDuration"
    ref="taskRef"
    class="gantt-elastic__chart-row-bar-wrapper gantt-elastic__chart-row-task-wrapper"
    @click="logTask"
  >
   <foreignObject
      v-if="!isEmptyOrFallback(task.image)"
      :x="safe(task.x - root.state.options.chart.prefix.offset - 32)"
      :y="safe(task.y + (root.state.options.row.height / 2) - 16)"
      :width="32"
      :height="32"
    >
      <img class="prefix-image" :src="task.image" :title="task.imageTitle || ''" />
    </foreignObject>
    <svg
      class="gantt-elastic__chart-row-bar gantt-elastic__chart-row-task"
      :x="task.x"
      :y="task.y"
      :width="task.width"
      :height="task.height"
      :viewBox="`0 0 ${task.width} ${task.height}`"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        class="gantt-elastic__chart-row-bar-polygon gantt-elastic__chart-row-task-polygon"
        :points="getPoints"
      />
      <template v-for="(sub, idx) in task.subs" :key="`${sub}-${idx}`">
        <g v-if="showSub[idx]">
          <polygon
            class="sub-task gantt-elastic__chart-row-bar-polygon gantt-elastic__chart-row-task-polygon"
            :style="sub.style || {}"
            :points="getSubsPoints[idx]"
          />
          <chart-text
            v-if="sub.label"
            class="is-normal"
            :task="task"
            :position="getSubsPointsRaw[idx][0]"
            :size="{ height: task.height }"
            :text="showSubLabel ? getSubTaskDetailLabel(sub) : sub.label"
          />
        </g>
      </template>
    </svg>
    <chart-text v-if="showTaskLabel" :task="task" />
  </g>
</template>

<script>
import { defineComponent, ref, computed, inject } from 'vue';
import { useElementHover } from "@/hooks";
import { safe, isEmptyOrFallback } from "../../../utils";
import ChartText from '../chart-text.vue';
import taskMixin from './task.mixin.js';

export default defineComponent({
  name: 'Task',
  components: {
    ChartText,
  },
  inject: ['root'],
  props: ['task'],
  mixins: [taskMixin],
  data() {
    return {
    };
  },
  setup() {
    const root = inject('root');

    const taskRef = ref(null);
    const isHover = useElementHover(taskRef);
    const showSubLabel = computed(() => isHover.value);
    const showTaskLabel = computed(() => {
      // const showText = root?.state?.options?.chart?.text?.display
      // const showLabel = root?.state?.options?.chart?.task?.label?.display
      // const onlyOnHover = true
      // const res = (showLabel && onlyOnHover)
      //   ? (isHover.value && showText)
      //   : (showText)
      // return res
      return true
    });

    const getSubTaskDetailLabel = (sub) => {
      const curUsername = sub?.operator?.name || ''
      const nextUsername = sub?.next?.operator?.name || ''

      if (sub.stage === 'wait') {
        const operator = [curUsername, nextUsername].filter(x => x).join(' -> ')
        const text = [sub.label, operator].filter(x => x).join(' - ')
        return text
      } else {
        const text = [sub.label, curUsername].filter(x => x).join(' - ')
        return text
      }
    }

    return {
      taskRef,
      isHover,
      showSubLabel,
      showTaskLabel,
      getSubTaskDetailLabel,
      isEmptyOrFallback,
      safe,
    }
  },
  computed: {

    isSafeDuration () {
      try {
        const n = this.task.duration
        const isSafe = Number.isInteger(+n) && !isNaN(n)
        // console.log('[debug] isSafeDuration', isSafe, n)
        return isSafe
      } catch (err) {
        console.log('[ERR] err in duration valid', err)
        return false
      }
    },

    /**
     * Get points
     *
     * @returns {string}
     */
    getPoints() {
      const task = this.task;
      // console.log('[debug] task', task)
      return `0, 0 ${task.width}, 0 ${task.width}, ${task.height} 0, ${task.height}`;
    },
    getSubsPointsRaw() {
      const task = this.task;
      const subs = this.task.subs;
      const duration = safe(task.end - task.start);
      const res = [];
      subs.map((sub) => {
        const points = [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: task.height },
          { x: 0, y: task.height },
        ]
        const [percent1, percent2] = [
          safe(sub.start - task.start) / duration,
          safe(sub.start + sub.duration - task.start) / duration,
        ]
        // console.log('[debug] current last', idx, lastPoint)
        const strokeWidth = 1;
        points[0].x = task.width * percent1 + strokeWidth;
        points[1].x = task.width * percent2 - strokeWidth;
        points[2].x = points[1].x;
        points[3].x = points[0].x;

        res.push(points)
      })
      return res;
    },
    getSubsPoints() {
      const res = this.getSubsPointsRaw || [];
      return res.map(points => points.map(point => safe(point.x) + ', ' + safe(point.y)).join(' '));
    },
    showSub() {
      const subs = this.getSubsPointsRaw;
      const isSame = (n1, n2) => {
        try {
          const threshold = 0.1;
          return Math.abs(+n1 - +n2) < threshold;
        } catch (err) {
          console.log('[ERR] err in showSub', err)
          return false
        }
      }
      return subs.map(points => points[0] && points[1] && !isSame(points[0].x, points[1].x));
    },
  },
  methods: {
    logTask () {
      console.log('[debug] task', this.task)
    }
  }
});
</script>

<style lang="less">
.gantt-elastic__chart-row-bar-polygon {
  stroke: #5392ee;
  stroke-width: 1;
  fill: #5392ee;
}
/* TODO scope */
.prefix-image {
  box-sizing: border-box;
  padding: 3px;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: solid 1px transparent;

  &:hover {
    border: solid 1px #f7d5d0;
  }
}
.is-normal {
  background: red;

  .gantt-elastic__chart-row-text {
    padding: 0;
    background: unset;
  }
}
</style>
