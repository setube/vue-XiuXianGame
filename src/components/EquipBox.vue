<template>
	<div class="xm-equip-box">
		<div class="xm-equip-item" v-for="(item, index) in list" :key="index">

			<span class="xm-equip-item-type">{{ item.name }}</span>
			<div class="xm-equip-item-cnt" v-if="player.equipment[item.key]?.name" :class="{
				'el-tag': 1,
				[`el-tag--${player.equipment[item.key].quality}`]: 1
			}" @click="equipmentInfo(item.key)">
				<span>
					{{ player.equipment[item.key].name }}
				</span>

				<!-- 卸装备按钮 -->
				<span class="xm-equip-item-close" @click.stop="equipmentClose(item.key)">
					<i class="el-icon-close"></i>
				</span>
				<!-- 强化数据 -->
				<span class="xm-equip-item-add" v-if="player.equipment[item.key]?.strengthen">
					<span> +{{ player.equipment[item.key]?.strengthen }} </span>
				</span>
			</div>
			<!-- <el-tag v-if="player.equipment[item.key]?.name" :type="player.equipment[item.key]?.quality"
				:closable="player.equipment[item.key]?.name ? true : false" @close="equipmentClose(item.key)"
				@click="equipmentInfo(item.key)">
				{{ player.equipment[item.key]?.name }}{{ player.equipment[item.key]?.strengthen ? '+' + player.equipment[item.key]?.strengthen : '' }}
			</el-tag> -->
			<div class="xm-equip-item-cnt el-tag el-tag--info" v-else>无</div>
		</div>

		<div class="xm-equip-item">
			<span class="xm-equip-item-type">灵宠</span>
			<div class="xm-equip-item-cnt" v-if="player.pet?.name" :class="{
				'el-tag': 1,
				[`el-tag--${computePetsLevel(player.pet?.level)}`]: 1
			}" @click="petShow">
				<span>
					{{ player.pet?.name }}

				</span>

				<!-- 卸宠物按钮 -->
				<span class="xm-equip-item-close" @click.stop="petRetract">
					<i class="el-icon-close"></i>
				</span>
			</div>
			<div class="xm-equip-item-cnt el-tag el-tag--info" v-else>无</div>
		</div>

		<!-- <div class="equip">
			<span>灵宠: </span>
			<el-tag class="pet" v-if="player.pet?.name" :type="computePetsLevel(player.pet?.level)" closable
				@close="petRetract"
				@click="petItemShow = true">{{ player.pet?.name }}({{levelNames[player.pet.level]}})</el-tag>
			<span v-else>无</span>
		</div> -->
	</div>
</template>

<script>
	// 一些工具方法
	import util from '../plugins/mixin.js'
	export default {
		mixins: [util],
		props: {
			player: {
				required: true,
			}
		},
		data() {
			return {
				list: [
					{ name: '神兵', key: 'weapon' },
					{ name: '护甲', key: 'armor' },
					{ name: '灵宝', key: 'accessory' },
					{ name: '法器', key: 'sutra' },
				]
			}
		},
		methods: {
			equipmentInfo(type) {
				this.$emit('equipmentInfo', type)
			},
			equipmentClose(type) {
				this.$emit('equipmentClose', type)
			},
			petShow(){
				this.$emit('petShow')
			},
			petRetract() {
				this.$emit('petRetract')
			}
		},
	}
</script>

<style>
	.xm-equip-box {
		background-color: #EFEFEF;
		margin-top: 0;
		padding: 10px 0;
		border-radius: 4px;
		margin-bottom: 4px;
		display: flex;
		justify-content: center;
	}

	.xm-equip-item {
		width: 100px;
		height: 100px;
		border: 1px solid #CCC;
		margin-right: 5px;
		border-radius: 4px;
		position: relative;
		cursor: pointer;

	}

	.xm-equip-item-type {
		position: absolute;
		left: 0px;
		top: 0;
		font-size: 12px;
		padding: 2px 4px;
		background-color: rgba(0, 0, 0, 0.1);
	}

	.xm-equip-item-cnt {
		width: 100%;
		height: 100% !important;
		display: flex !important;
		align-items: center;
		justify-content: center;
		line-height: unset !important;
	}

	.xm-equip-item-close {
		position: absolute;
		right: 4px;
		top: 0;
		color: #999;
	}

	.xm-equip-item-add {
		position: absolute;
		left: 0px;
		bottom: 0;
		font-size: 12px;
		padding: 2px 4px;
		background-color: rgba(0, 0, 0, 0.1);
		color: red;
	}
</style>