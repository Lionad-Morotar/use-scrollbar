import { reactive } from "vue";

export default function useHelloWorld() {
  const states = reactive({
    hello: 'world'
  })
  return states;
}
