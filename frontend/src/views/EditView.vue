<template>
	<div class="view-container">
		<div class="block_container ">
			<div v-if="user.isTwoFactorAuthentificationEnabled"> 
				<p>2 Factor is activate</p>
				<input  v-model="code2auth" type="text" placeholder="Please enter your code:">
				<button @click="validateCode(code2auth)">Deactivate 2Factor</button>
			</div>
			<div v-else>
				<p>2 Factor is not activate</p>
				<div>
					<button @click="getQrcode()">Clique ici pour afficher le QRcode</button>
				</div>
				<div>
					<img :src="user.qrcode" showQrCode>
				</div>
				<input  v-model="code2auth" type="text" placeholder="Please enter your code:">
				<button @click="validateCode(code2auth)">Activate 2Factor</button>
			</div>

			
		</div>

		<div class="block_container ">
			<p>Your current avatar:</p>
			<img :src="DisplayImage()"/>
			<input type="file" @change="onSubmit" accept=".jpg,.jpeg,.png">
		</div>

		<div class="block_container ">
			<p>Change  your Username. </p>
			<p style="font-size: 30px;"> Now you are : {{user.username}}</p>
			<input v-model="newUsername" type="text" placeholder="Please enter new Username">
			<button @click="changeUsername(newUsername)">Change username</button>
		</div>
	</div>
</template>


<script lang="ts">
import { mapState } from 'vuex'
import router from '@/router';
import store from '@/store';

export default {
	name: 'EditView',
	data: function () {
		return {
			newUsername: '',
			qrdata: '',
			code2auth: '',
			showQrCode: true,
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
		getQrcode: function() {
			store.dispatch('getQrCode', store.state.user.id);
		},
		QrCode: function() {
			return store.state.user.qrcode;
		},
		DisplayImage: function () {
			if (!store.state.user.avatarId)
				return store.state.user.avatar42;
			else {
				return store.state.user.avatar;
			}
		},
		FetchImage: function () {
		},
		validateCode: function (code: string) {
			if (code.length < 3 || code.length > 10) {
				alert('Error size');
				return 
			}
			if (/^[0-9]+$/.test(code) == true) {
				store.dispatch('validationCode', code);
			}
			else {
				alert('Only  numbers');
				return 
			}
		},
		changeUsername: function (test: string) {
			if (test.length < 5) {
				alert('too short');
				return ;
			}
			if (test.length > 15) {
				alert('too long');
				return ;
			}
			else {
				if (/^[a-zA-Z]+$/.test(test) == true)
				{
					store.dispatch('changeUsername', test)
					.then(function () {
					}), function () {
					}
				}
				else {
					alert('only letters');
					return ;
				}
			}
		},
		onSubmit: function (event: Event) {
			const target = (event.target as HTMLInputElement)
			if (!target.files) {
			}
			else {
				const file = target.files[0];
				const formData = new FormData()
				formData.append('file', file);
				store.dispatch('updateAvatar', formData)
				.then(function () { 
				}), function () {
				}
			}
		}
	}
}
</script>

<style>

.view-container p {
	text-align: center;
	font-size: 50px;
}

.view-container {
	margin-top: 77px;
	width: 70%;
	float: right;
	border: 2px solid green;
	height: 100%;
	color: bisque;
	overflow-y: scroll;
}

.block_container {
	margin: 10%;
}

.block_container table {
	width: 100%;
}

.block_container tr {
	border: 1px solid white;
}

.block_container img {
	display: block;
	margin-left: auto;
	margin-right: auto;
	width: 50%;
}

.block_container button,
.block_container input {
	width: 100%;
	margin: 10px;
}

.block_container button {
	border-radius: 10px;
}

.block_container input {
	height: 50px;
	border-radius: 10px;
}

.list {
	list-style-type: none;
	text-align: center;
}

.button-exside {
	width: 100%;
	margin: 5px;
	border-radius: 10px;
}

.button-inside {
	width: 100%;
	border-radius: 10px;
}
</style>