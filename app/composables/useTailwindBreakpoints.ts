import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

export const useTailwindBreakpoints = () => {
  const breakpoints = useBreakpoints(breakpointsTailwind)

  const smAndLarger = breakpoints.greaterOrEqual('sm') // sm and larger
  const largerThanSm = breakpoints.greater('sm') // only larger than sm
  const lgAndSmaller = breakpoints.smallerOrEqual('lg') // lg and smaller
  const smallerThanLg = breakpoints.smaller('lg') // only smaller than lg

  return {
    smAndLarger,
    largerThanSm,
    lgAndSmaller,
    smallerThanLg
  }
}
