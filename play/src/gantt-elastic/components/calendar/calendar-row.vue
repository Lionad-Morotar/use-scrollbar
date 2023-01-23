<template>
  <div :class="'gantt-elastic__calendar-row gantt-elastic__calendar-row--' + which">
    <div
      v-for="(item, itemIndex) in items"
      :key="item.key"
      class="gantt-elastic__calendar-row-rect"
    >
      <div
        class="gantt-elastic__calendar-row-rect-child"
        :class="`is-${which}`"
        v-for="(child, childIndex) in item.children"
        :key="child.key"
        :style="rectChildStyle[itemIndex][childIndex]"
      >
        <span class="gantt-elastic__calendar-row-text" :class="`is-${which}`">
          {{ child.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CalendarRow',
  inject: ['root'],
  props: ['items', 'which'],
  data() {
    return {};
  },
  computed: {
    rectChildStyle() {
      const basicStyle = {};
      const style = [];
      for (let item of this.items) {
        const childrenStyle = [];
        for (let child of item.children) {
          childrenStyle.push({
            ...basicStyle,
            width: child.width + 'px',
            height: child.height + 'px'
          });
        }
        style.push(childrenStyle);
      }
      return style;
    },
  }
});
</script>

<scope lang="less">
.gantt-elastic__calendar-row {
  display: flex;

  &.gantt-elastic__calendar-row--hour {
    border-bottom: "1px solid #eee";
  }
}
.gantt-elastic__calendar-row-rect-child {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-right: solid 1px #dadada;
  text-align: center;
}
.gantt-elastic__calendar-row-text {
  &.is-month {
    font-size: 20px;
    font-weight: bold;
  }
}
</scope>