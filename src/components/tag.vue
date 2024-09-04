<template>
    <el-tag :disable-transitions="true" :class="customTypeClass">
        <slot></slot>
    </el-tag>
</template>

<script>
    export default {
        name: 'CustomTag',
        props: {
            type: {
                type: String,
                default: 'info',
            }
        },
        computed: {
            customTypeClass () {
                if (this.type === 'pink') return 'el-tag--pink';
                else if (this.type === 'purple') return 'el-tag--purple';
                else return `el-tag--${this.type}`;
            }
        }
    };
</script>