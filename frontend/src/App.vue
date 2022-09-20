<template>
	<AppBar />
	<div class="main-container">
		<router-view />
		<ChatComponent v-if="isLogged() && is2F()" />
	</div>
</template>

<script>
import ChatComponent from './components/ChatComponent.vue'
import AppBar from './components/AppBar.vue';
import store from '@/store';
import router from '@/router';
import axios from 'axios';

export default { 
	name: 'App',
	components: {
	AppBar,
	ChatComponent
  },
  methods : {
	isLogged : () => { 
		return store.state.isLoggedIn
	},
	is2F: () => {
		return store.state.user.isTwoFactorAuthentificationEnabled === false ||
		(store.state.user.isTwoFactorAuthentificationEnabled === true && store.state.isEnterCode === true);
	}
  },
  created() {
  },
	mounted: function() { 
		if (localStorage.getItem('user') != null) {
			axios.get('/api/authentification/status')
			.then((response) => {
				if (response.status == 200) {
					store.dispatch('login', response);
					if (store.state.isLoggedIn == true) {
						router.push("/profile");
						return ;
					}
				}
			})
		}
		let allcookies = document.cookie;
		if (allcookies) {
			axios.get('/api/authentification/status')
			.then((response) => {
				if (response.status == 200) {
					store.dispatch('login', response);
					if (store.state.isLoggedIn == true) {
						router.push("/profile");
						return ;
					}
				}
			})
		}
	}
}
</script>

<style>

body {
	padding: 0;
	margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.main-container {
	width: 100%;
	height: 100%;
	position: absolute;
}


</style>

