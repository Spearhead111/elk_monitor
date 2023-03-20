export const sidebarList = [
  {
    id: 1,
    naviName: 'Home',
    prefixIcon: 'icon-a-1',
    path: '/home',
    // secondList: [],
  },
  {
    id: 2,
    naviName: 'Home',
    prefixIcon: 'icon-a-1',
    suffixIcon: 'icon-jiantouxia',
    path: '',
    secondList: [
      { name: 'sec1234', path: '/home' },
      { name: 'sec1', path: '/home' },
      { name: 'sec123', path: '/home' },
    ],
  },
  {
    id: 3,
    naviName: 'Home',
    prefixIcon: 'icon-a-1',
    path: '/404',
    // secondList: [],
  },
  {
    id: 4,
    naviName: 'Home',
    prefixIcon: 'icon-a-1',
    suffixIcon: 'icon-jiantouxia',
    path: '',
    secondList: [
      { name: 'sec1', path: '/games/drum' },
      { name: 'sec1', path: '/home' },
      { name: 'sec1', path: '/home' },
    ],
  },
  {
    id: 5,
    naviName: 'Elk',
    tag: 'elk',
    // prefixIcon: 'icon-a-1',
    imgUrl: '@/assets/icons/elk.ico',
    path: '/elk',
    // secondList: [],
  },
]
