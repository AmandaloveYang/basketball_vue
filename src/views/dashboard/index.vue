<template>
  <div class="dashboard-container">
    <div class="search-container">
      <el-input
        v-model="searchTeam"
        placeholder="请输入球队名称"
        class="search-input"
        clearable
        @input="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
      </el-input>
    </div>

    <div v-if="searchResults.length > 0" class="search-results">
      <el-card class="search-result-card">
        <div class="result-title">搜索结果：</div>
        <div v-for="(result, index) in searchResults" :key="index" class="result-item">
          <div class="result-date">{{ result.date }}</div>
          <div class="result-match">
            <span :class="{ 'winner': result.isHomeWinner }">{{ result.homeTeam }}</span>
            <span class="score">{{ result.homeScore }} - {{ result.awayScore }}</span>
            <span :class="{ 'winner': result.isAwayWinner }">{{ result.awayTeam }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <div class="game-container">
      <el-col
        v-for="(item,index) in gameList"
        :key="item.dayBlock"
        class="game-item"
      >
        <el-card v-loading="loading" class="box-card" shadow="always">
          <div slot="header" class="clearfix">
            <div>{{ item.dayBlock }}</div>
            <!--当天的赛程-->
            <div>{{ item.matchList[0].competitionStageDesc }}({{ item.matchList[index] ? item.matchList[index].matchStatusChinese : '未开始' }})</div>
          </div>
          <div v-for="(game,j) in item.matchList" :key="j" class="text item" style="margin-top:10px ;">
            <div class="schedule">
              <div class="team">
                <div>
                  {{ game.homeTeamName }}
                  <span v-if="game.homeScore > game.awayScore" class="win-mark">✓</span>
                </div>
                <div style="margin-top: 10px;">
                  {{ game.awayTeamName }}
                  <span v-if="game.awayScore > game.homeScore" class="win-mark">✓</span>
                </div>
              </div>
              <div class="score">
                <div>{{ game.homeScore }}</div>
                <div style="margin-top: 10px;">{{ game.awayScore }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </div>
    <el-main>
      <el-select v-model="form.time" placeholder="请选择时间" default-first-option>
        <el-option v-for="(item, index) in time" :key="index" :label="item" :value="item" />
      </el-select>
      <div id="main" /> <!-- 这是用来展示echarts图表的容器 -->
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
      searchTeam: '', // 搜索关键词
      searchResults: [], // 搜索结果
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
        myChart.resize() // 监听窗口大小变化，自动调整图表大小
      })
    },

  },
  async created() {
    this.Option = {} // 初始化echarts的Option
    try {
      const res = JSON.parse(JSON.stringify(await hupuScheduleList()))
      this.gameList = res.result.gameList
      if (res.status === 200) this.loading = false
      this.matchList = this.gameList.map(item => item.matchList)
      this.time = this.gameList.map(item => item.dayBlock)

      // 直接设置默认值为"今天"
      const defaultValue = this.time.find(date => date.includes('今天'))
      this.form.time = defaultValue || this.time[0]

      // 确保在数据加载完成后立即触发 watch
      this.$nextTick(() => {
        if (this.form.time) {
          // 手动触发一次 watch
          this.$watch('form.time', this.$options.watch['form.time'])
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
  mounted() {
  },
  methods: {
    // 初始化和更新图表
    initChart(option) {
      const myChart = echarts.init(document.getElementById('main'))
      myChart.setOption(option)
      window.addEventListener('resize', () => {
        myChart.resize()
      })
    },
    handleSearch() {
      if (!this.searchTeam) {
        this.searchResults = []
        return
      }

      const results = []
      this.gameList.forEach(game => {
        game.matchList.forEach(match => {
          if (match.homeTeamName.includes(this.searchTeam) ||
              match.awayTeamName.includes(this.searchTeam)) {
            results.push({
              date: game.dayBlock,
              homeTeam: match.homeTeamName,
              awayTeam: match.awayTeamName,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              isHomeWinner: match.homeScore > match.awayScore,
              isAwayWinner: match.awayScore > match.homeScore,
            })
          }
        })
      })
      this.searchResults = results
    },
  },
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
    min-height: 100vh;
    background-color: #f5f7fa;  // 柔和的浅灰色背景
    padding: 20px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}

// 美化卡片样式
.box-card {
  background-color: #ffffff;
  transition: all 0.3s ease;
  border: none;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  }
}

.clearfix {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.schedule {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.score {
  color: #f56c6c;
  font-weight: bold;
}

#main {
  height: 400px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

// 添加行间距
.row-margin {
  margin-bottom: 30px;
}

.win-mark {
  color: #f56c6c;
  margin-left: 4px;
  font-weight: bold;
}

// 美化选择器样式
.el-main {
  background-color: transparent;
  .el-select {
    margin-bottom: 20px;
  }
}

// 添加卡片内容样式
.text.item {
  &:hover {
    background-color: #fafafa;
    border-radius: 4px;
  }
}

.team {
  flex: 1;
  div {
    padding: 4px 0;
  }
}

// 添加新的flex布局样式
.game-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-left: 50px;
}

.game-item {
  flex: 0 0 calc(20% - 24px); // 默认5个一排
  min-width: 250px; // 设置最小宽度
}

// 响应式布局
@media screen and (max-width: 1600px) {
  .game-item {
    flex: 0 0 calc(25% - 24px); // 4个一排
  }
}

@media screen and (max-width: 1200px) {
  .game-item {
    flex: 0 0 calc(33.33% - 24px); // 3个一排
  }
}

@media screen and (max-width: 900px) {
  .game-item {
    flex: 0 0 calc(50% - 24px); // 2个一排
  }
}

@media screen and (max-width: 600px) {
  .game-item {
    flex: 0 0 100%; // 1个一排
  }
}

.search-container {
  margin: 0 50px 20px;
  .search-input {
    max-width: 400px;
  }
}

.search-results {
  margin: 0 50px 20px;
  .search-result-card {
    margin-bottom: 20px;
  }
  .result-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
  }
  .result-item {
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;
    &:last-child {
      border-bottom: none;
    }
  }
  .result-date {
    color: #909399;
    font-size: 14px;
    margin-bottom: 5px;
  }
  .result-match {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 500px;

    .score {
      color: #f56c6c;
      font-weight: bold;
      margin: 0 20px;
    }
    .winner {
      color: #67c23a;
    }
  }
}
</style>
