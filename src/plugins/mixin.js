export default {
	methods: {
		// 计算灵宠等级
		computePetsLevel(lv) {
			if (lv >= 1 && lv <= 9) return 'success';
			if (lv >= 10 && lv <= 19) return 'primary';
			if (lv >= 20 && lv <= 29) return 'warning';
			if (lv >= 30) return 'danger';
		},
	}
}