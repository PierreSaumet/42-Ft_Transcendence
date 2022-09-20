<template>
<div class="view-container">
	<div class="block_header">
		<img :src="DisplayImage()" />
		<p> Your profil information:</p>
	</div>

	<div class="block_container">
		<table>
			<thead>
				<th>Username</th>
				<th>STATUS</th>
				<th>GAMES PLAYED </th>
				<th>GAMES WON </th>
				<th>GAMES LOSSE </th>
			</thead>
			<tbody>
				<tr>
					<td>{{user.username}}</td>  
					<td>{{ user.status }}</td>
					<td>{{user.tt_games}}</td> 
					<td>{{user.wins}}</td> 
					<td>{{user.losses}}</td>
				</tr> 
			</tbody>
		</table>
	</div>

	<div class="block_container">
		<button @click="getAllUsers()" class="button-exside">Refresh</button>
		<table>
			<thead>
				<th>Username</th>
				<th>Status</th>
				<th>Score</th>
				<th>Action</th>
				<th>TEST</th>
			</thead>
			<tbody>
				<tr v-for="item in all_users" :key="item.id">
					<td>{{item.username}}</td> 
					<td>{{item.status}}</td>
					<td>{{item.score}}</td>
					<td><button @click="addFriend(item.username)" v-if="!ifIsFriend(item.username)"> Add friend</button></td>
					<td><button @click="JulesRelou(item.username)" v-if="item.status == 'in_game'">Spectate</button> </td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="block_container">
		<table>
			<thead>
				<th>Username</th>
				<th>Status</th>
				<th>Action</th>
			</thead>
			<tbody>
				<tr v-for="item in friend_list" :key="item">
					<td><button class="button-inside" @click="goToProfile(item.username)"> {{item.username}}</button></td>
					<td>{{item.status}}</td>
					<td><button class="button-inside"  @click="removeFriend(item.username)"> Remove friend</button></td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="block_container">
		<button @click="matchHistory()" class="button-exside">Display/Rerefresh your Match History</button>
		<p>Your Match History:</p>
		<ul class="list">
			<li v-for="item in match_History" :key="item">{{item}}</li>
		</ul>
	</div>
</div>
</template>


<script lang="ts">
/* eslint-disable */
import store from '@/store';
import router from '@/router';
import { mapState } from 'vuex';


export default {
	name: 'ProfilView',
	data: function () {
		return {
		}
	},
	mounted: function() { 
		if (store.state.isLoggedIn == false) {
			router.push("/");
			return ;
		}
		if (store.state.user.avatarId != null) {
			store.dispatch('getAvatar');
		}
		store.dispatch('putOnline');
		store.dispatch('getAllUsers');
		store.dispatch('getFriends');
		store.dispatch('getMatchHistory');
		store.dispatch('getVictory');
		store.dispatch('getGamesPlayed');
		store.dispatch('getLoose');
		store.dispatch('getLadderPosition');
		store.dispatch('getScore');
	},
	computed: {
		...mapState({
			user: 'user',
			all_users: 'allUsers',
			friend_list: 'friendsList',
			match_History: 'matchHistory',
		}),

	},
	methods: {
		JulesRelou: async function (username:string) {
			store.dispatch('getFriendStatus', username)
			.then( function () {
			})
		},
		goToProfile: function (username: string) {
			if (username)
				router.push('/profile/' + username);
		},
		DisplayImage: function () {
			if (store.state.user.avatarId == null)
				return store.state.user.avatar42;
			else {
				return store.state.user.avatar;
			}
		},
		updateMatchHistory: function () {
			store.dispatch('updateMatchHistory');
		},
		matchHistory: function() {
			store.dispatch('getMatchHistory');
		},
		removeFriend: function(username:string) {
			store.dispatch('delFriend', username);
		},
		addFriend: function(username:string) {
			store.dispatch('addFriend', username);
		},
		getAllUsers: function() {
			store.dispatch('getAllUsers');
		},
		ifIsFriend(u: string) {
			return store.state.friendsList.find((f:any) => f.username === u) 
		}
	}

}


</script>

<style>

.view-container p {
	text-align: center;
}

.view-container {
	margin-top: 77px;
	width: 50%;
	float: right;
	border: 2px solid green;
	height: 100%;
	color: bisque;
	overflow-y: scroll;
}

.block_header {
	width: 100%;
}

.block_header {
	margin: 10% 0;
}

.block_header img {
	display: block;
	margin-left: auto;
	margin-right: auto;
	width: 50%;
}

.block_header p {
	text-align: center;
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
