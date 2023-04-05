import request from '@/utils/request'

export function hupuScheduleList(params) {
  return request({
    url: 'https://games.mobileapi.hupu.com/1/7.5.60/basketballapi/scheduleList?competitionTag=nba',
    method: 'get',
    params,
  })
}
// 图形数据
export function graphData(params) {
  return request({
    url: 'https://api.balldontlie.io/graphs/79/graphData/api',
    method: 'get',
    params,
  })
}
