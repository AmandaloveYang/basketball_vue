<template>
  <div class="dashboard-container">
    <div>
      <el-row :gutter="30">
        <el-col v-for="(item,index) in gameList" :key="item.dayBlock" :offset="0" :span="3">
          <el-card v-loading="loading" class="box-card" shadow="always">
            <div slot="header" class="clearfix">
              <div>{{ item.dayBlock }}</div>
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
  </div>
</template>

<script >

import { hupuScheduleList } from '@/api/basketball.js'
export default {
  name: 'Dashboard',
  data() {
    return {
      gameList: [],
      loading: true,
    }
  },
  computed: {

  },
  async created() {
    try {
      const res = JSON.parse(JSON.stringify(await hupuScheduleList()))
      this.gameList = res.result.gameList
      if (res.status === 200) this.loading = false
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
</style>
