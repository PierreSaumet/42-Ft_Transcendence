<template>
<div class="base">
        <input  v-model="code2auth" class="form-row__input" type="text" placeholder="Enter your code...">
        <button class="button_gt" @click="validateCode(code2auth)">Confirm</button>
        <p class="msg"> You have activated the 2FA</p>
        <p class="msg1"> To login please enter your code:</p>
</div>
</template>

<script lang="ts">
import router from '@/router';
import store from '@/store';
import { mapState } from 'vuex';


export default {
    name: 'TwoFactor',
    data: function () {
        return {
            code2auth: '',
        }
    },
    mounted: function() { 
        if (store.state.isLoggedIn == false) {
            router.push("/");
            return ;
        }
    },
    computed: {
		...mapState({
			user: 'user',
		})
	},
    methods: {
        validateCode: function (code: string) {
            const elem = {
                'code': code,
                'user' : store.state.user
            };
            if (/^[0-9]+$/.test(code) == true) {
                store.dispatch('authentificate2F', elem)
                /* eslint-disable  @typescript-eslint/no-explicit-any */
                .then(function (response: any) {
                    store.dispatch('relou', true);
                    if (response.status == 201)
                        router.push('/profile')
                })
                .catch(function () {
                })
            }
            else {
                alert('Only  numbers');
            }
        }
    }

}

</script>

<style>

.button_gt {
    text-align: center;
	background-color: transparent;
	color: rgb(234, 234, 153);
	border: 2px solid #eff0f4;
	border-radius: 12px;
	position: fixed;
	top: 30%;
    font-size: 2vmin;
    left: 50%;
    width: 25%;
}

.form-row__input{
    position: fixed;
    left: 50%;
	top: 25%;
    width: 25%;
    font-size: 2.2vmin;
}

.msg1{
    font-family: "Trebuchet MS";
	font-style: oblique;
	color: rgba(255, 192, 203, 0.875);
	position: fixed;
	top: 20%;
    text-align: center;
    left : 44%;
    font-size: 2.2vmin;
}

.msg{
    font-family: "Trebuchet MS";
	font-style: oblique;
	color: rgb(234, 234, 153);
	position: fixed;
	top: 15%;
    text-align: center;
    left: 42%;
    font-size: 3.2vmin;
}
</style>
