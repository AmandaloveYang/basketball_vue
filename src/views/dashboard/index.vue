<template>
  <div class="dashboard-container">
    <div>
      <el-row :gutter="30">
        <el-col v-for="(item,index) in gameList" :key="item.dayBlock" :offset="0" :span="3">
          <el-card v-loading="loading" class="box-card" shadow="always">
            <div slot="header" class="clearfix">
              <div>{{ item.dayBlock }}</div>
              <!--当天的赛程-->
              <div>{{ item.matchList[0].competitionStageDesc }}({{ item.matchList[index] ? item.matchList[index].matchStatusChinese : '未开始' }})</div>
            </div>
            <div v-for="(game,j) in item.matchList" :key="j" class="text item" style="margin-top:10px ;">
              <div class="schedule">
                <div class="team">
                  <div>{{ game.homeTeamName }}</div>
                  <div style="margin-top: 10px;">
                    {{ game.awayTeamName }}</div>
                </div>
                <div class="score">
                  <div>{{ game.homeScore }}</div>
                  <div style="margin-top: 10px;">{{ game.awayScore }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <el-main>
      <el-select v-model="form.time" placeholder="请选择时间" default-first-option>
        <el-option v-for="(item, index) in time" :key="index" :label="item" :value="item" />
      </el-select>
      <div id="main" />
    </el-main>
  </div>
</template>

<script >

import { hupuScheduleList } from '@/api/basketball.js'
import * as echarts from 'echarts'
export default {
  name: 'Dashboard',
  data() {
    return {
      gameList: [], // 每周的赛程
      matchList: [], // 每天比赛的信息
      loading: true,
      form: {
        time: '', // 选择的时间
      },
      time: '',
      Option: {}, // echarts的Option
    }
  },
  computed: {
    timeList() {
      return this.gameList.map(item => item.dayBlock)
    },
  },
  watch: {
    'form.time'(val) {
      const dayBlock = this.gameList.map(item => item.dayBlock) // 每天的时间
      const teams = this.matchList.map(item => item.map(item => `${item.homeTeamName} vs ${item.awayTeamName}`)) // echarts的Option的data数据
      if (dayBlock.includes(val)) {
        const { matchList } = this.gameList.find(game => game.dayBlock === val)
        const selectDayGames = teams[dayBlock.indexOf(val)]
        const homeScores = []
        const awayScores = []
        matchList.forEach(item => {
          homeScores.push(item.homeScore)
          awayScores.push(item.awayScore)
        })
        const optionSeries = [
          {
            type: 'bar',
            data: homeScores,
            barGap: '20%',
            barCategoryGap: '40%',
          },
          {
            type: 'bar',
            data: awayScores,
          },
        ]
        this.Option = {
          xAxis: {
            data: selectDayGames,
          },
          yAxis: {},
          series: optionSeries,
        }
      }
      var myChart = echarts.init(document.getElementById('main'))
      myChart.setOption(this.Option)
      window.addEventListener('resize', function() {
        myChart.resize()
      })
    },

  },
  async created() {
    this.Option = {} // 初始化echarts的Option
    console.log(this.Option, 'this.Option')
    try {
      const res = JSON.parse(JSON.stringify(await hupuScheduleList()))
      this.gameList = res.result.gameList
      if (res.status === 200) this.loading = false
      this.matchList = this.gameList.map(item => item.matchList)
      this.time = this.gameList.map(item => item.dayBlock)
      this.form.time = this.time.length ? this.time[0] : ''
    } catch (error) {
      console.log(error)
    }
  },
  mounted() {
  },
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
  .card-style {
  border-radius: 10px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

}
.clearfix{
  display: flex;
  justify-content: space-between;
}
.schedule{
    display: flex;
    justify-content: space-between;
 }
 .score{
       color: red;
     }
  #main {
    height: 400px;
  }
</style>
