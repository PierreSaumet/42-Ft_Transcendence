
<template>
<header class='header'>
	<div  class="header__wraper">
	<img
		alt="42"
		className="logo"
		src="https://transcendence.nforay.dev/img/42logo.ec2e6c25.svg"
	/>
	<div class="header__logo">WONDERFUL TRANSCENDENCE</div>
		<nav class="nav">
			<ul class="nav__list">
				<li class="nav__items">  
					<a class="nav__links" @click="profil()">
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bibi-person-heart" viewBox="0 0 16 16">
						<path d="M9 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h10s1 0 1-1-1-4-6-4-6 3-6 4Zm13.5-8.09c1.387-1.425 4.855 1.07 0 4.277-4.854-3.207-1.387-5.702 0-4.276Z"/>
						</svg>
					</a>
				</li>
				<li class="nav__items">
					<a class="nav__links" @click="edit()">
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bibi-gear-fill" viewBox="0 0 16 16">
						<path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
						</svg>
					</a>
				</li>
				<!-- <li class="nav__items">
					<a class="nav__links" href="/chat">
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-chat-right-heart" viewBox="0 0 16 16">
						<path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1H2Zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12Z"/>
						<path d="M8 3.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132Z"/>
						</svg>
					</a>
				</li> -->
				<li class="nav__items">
						<a class="nav__links" @click="game()">
							<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bibi-controller" viewBox="0 0 16 16">
							<path d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1z"/>
							<path d="M3.051 3.26a.5.5 0 0 1 .354-.613l1.932-.518a.5.5 0 0 1 .62.39c.655-.079 1.35-.117 2.043-.117.72 0 1.443.041 2.12.126a.5.5 0 0 1 .622-.399l1.932.518a.5.5 0 0 1 .306.729c.14.09.266.19.373.297.408.408.78 1.05 1.095 1.772.32.733.599 1.591.805 2.466.206.875.34 1.78.364 2.606.024.816-.059 1.602-.328 2.21a1.42 1.42 0 0 1-1.445.83c-.636-.067-1.115-.394-1.513-.773-.245-.232-.496-.526-.739-.808-.126-.148-.25-.292-.368-.423-.728-.804-1.597-1.527-3.224-1.527-1.627 0-2.496.723-3.224 1.527-.119.131-.242.275-.368.423-.243.282-.494.575-.739.808-.398.38-.877.706-1.513.773a1.42 1.42 0 0 1-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364 1.094-1.772a2.34 2.34 0 0 1 .433-.335.504.504 0 0 1-.028-.079zm2.036.412c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885 1.465a13.748 13.748 0 0 0-.748 2.295 12.351 12.351 0 0 0-.339 2.406c-.022.755.062 1.368.243 1.776a.42.42 0 0 0 .426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.504C4.861 9.969 5.978 9.027 8 9.027s3.139.942 3.965 1.855c.164.181.307.348.44.504.214.251.403.472.615.674.318.303.601.468.929.503a.42.42 0 0 0 .426-.241c.18-.408.265-1.02.243-1.776a12.354 12.354 0 0 0-.339-2.406 13.753 13.753 0 0 0-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27-1.036 0-2.063.091-2.913.27z"/>
							</svg>
						</a>
				</li>
				<li class="nav__items">
					<button  class="logout" @click="logout()" >
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
						<path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
						<path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
						</svg>
					</button>
				</li>
			</ul>
		</nav>
	</div>
</header>
</template>

<script lang="ts">
/* eslint-disable */ 
import router from '@/router';
import store from '@/store';



export default {
	name: 'AppBar',
   	// mounted: function() { // quand la vie est charge

    // },
    methods: {
        logout: function () {
            // // // // console.log("logout");
            store.dispatch('logout');
            router.push('/');
            // rajouter offline user dans le back et mettre la variable islogged frond en off
        },
		edit: function () {
			router.push('/edit');
		},
		profil: function () {
			router.push('/profile');
		},
		game: function () {
			router.push('/game');
		},
    }
}

</script>

<style>
.logout {
	background-color: transparent;
	border-style: none;
	width: 100%;
}

body {
  margin: 0;
  color: #ff7286;
  width: 100%;
}

.header {
  position: fixed;
  top: 0%;
  width: 100%;
  text-align: center;
  box-shadow: 0px 5px 5px gray;
  z-index: 1;
}
.header__wraper {
  position: fixed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 5%;
  background: rgba(255, 255, 255, 0.875);
}
.header__logo {
  font-weight:  bold;
  text-shadow: 4px 4px 5px rgb(122, 100, 100);
  font-family: Georgia, serif;
  font-size: 120%;
  color: rgba(0, 0, 0, 0.842);
  position: fixed;
  left:12%;
  font-size: 2vmin;
}

.nav {
  margin-right: 56px;
  
}
.nav__list {
  display: flex;
  padding: 0px;
  justify-content: space-between;
}
.nav__items {
  display: inline-block;
  color: #010101;
  word-break: keep-all;
}
.nav__links {
  font-size: 24px;
  margin: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease-in;
}
.nav__links:hover {
  background-color: #ff7286;
  color: #fff;
  width: 100%;
}

.button-guest {
	text-align: center;
	margin-left: auto;
	margin-right: auto;
	width: 100%;
	position: absolute;
	bottom: 300px;
}
.logo {
  height: 100%;
  top: 100%;
  font-size: 1vmin;
}
.name {
  font-size: 25px;
}
</style>