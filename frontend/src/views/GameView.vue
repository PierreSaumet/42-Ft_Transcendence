<template>
<div class="view-container">
    <main id="v-app">
        <section class="lobby" v-if="status=='lobby'">
            <p class="msg_afficher">Lobby</p>
            <button class="queue" :style="{ 'background-color': clicked ? 'grey' : '' }"
                v-on:click="clicked = !clicked">Special mode</button>
            <button class="queue" @click="queue()">Play</button> 
        </section>
        <section class="waiting" v-if="status=='waiting'">
            <p class="msg_afficher">LOOKING FOR A OPPONENT</p>
        </section>
        <section class="start" v-if="status=='start'">
            <p class="msg_afficher">{{ timer != 0 ? timer : ''}}</p>
        </section>
        <section class="ended" v-if="status=='ended'">
            <p class="msg_afficher">finito</p>
            <p>
                {{p1_username + ' ♛ : ' + score_p1 + ' - ' + score_p2 + ' : ✩ ' + p2_username}}
            </p>
        </section>
        <section class="play" v-if="status=='play'">
            <p class="msg_afficher">Pong !</p>
            <p class="score">
                {{p1_username + ' ♛ : ' + score_p1 + ' - ' + score_p2 + ' : ✩ ' + p2_username}}
             </p>
             <p class="pause">
                {{ timer != 0 ? 'The PONGGAME will resume in:  '+timer : ''}}
            </p>
        </section>
        <section class="container" v-if="status=='play'" ref="container">
            <canvas ref="canvas" class="canvas-pong" id="pong" :width="`${width}`" :height="`${height}`"></canvas>
        </section>
        <div>
            <p class="message_2" v-if="status!='ended'">USE KEYBOARDS'S ARROWS TO PLAY: ↥ UP ↧ DOWN </p>
        </div>
    </main>
</div>
</template>


<script lang="ts">
    import io from 'socket.io-client'
    import router from '@/router';
    import { useRoute } from "vue-router";
    import  store  from '@/store'
    import { Vue } from 'vue-class-component'
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Game extends Vue {
    socket = io('http://localhost:8081/game')
    id = 0
    player_id = ''
    p1_username = ''
    p2_username = ''
    score_p1 = 0
    score_p2 = 0
    status = 'lobby'
    ratio = 1
    width = 800
    height = 600
    timer = 0
    route = 0
    bgColor = 'transparent'
    clicked = false

    resizeCanvas(e: any) {
        if (e.target.innerWidth < 1700 || e.target.innerHeight < 1000) {
            this.ratio = 0.5
            this.width = 400
            this.height = 300
        }
        else if (e.target.innerWidth > 1700 || e.target.innerHeight > 1000) {
            this.ratio = 1
            this.width = 800 
            this.height = 600
        }
        else if (e.target.innerWidth >= 1500 || e.target.innerHeight >= 1500) {
            this.ratio = 1.5
            this.width = 1200 
            this.height = 900
        }
    }

    mounted() {
        if (store.state.isLoggedIn == false) {
            router.push("/");
            return ;
        }
        const route = useRoute();
		this.route = parseInt(route.params.id as string, 10); 
    } 

    created() { 
        this.socket.on('connect', () => {
            this.id = this.route;
            this.player_id = store.state.user.id
            if (this.player_id != '')
                this.socket.emit('triage', {id: this.id, player_id: this.player_id, specialMode: this.clicked, username: store.state.user.username});
        });

        this.socket.on('disconnect', () => {
            this.socket.emit('disconnect', {id: this.id}) 
        }) 

        this.socket.on('broadcast', (data: any) => {
            this.id = data.id
            this.score_p1 = data.score_p1;
            this.score_p2 = data.score_p2;
            this.status = data.status;
            if (this.status == 'play') {
                this.socket.emit('checkUserStatus', {player_id: this.player_id})
                this.draw(data)
            }
        });

        this.socket.on('updateState', (data: any) => {
            this.p1_username = data.p1_username
            this.p2_username = data.p2_username
            store.dispatch('putInGame');
            store.dispatch('watchGame', String(this.id)); 
        })

        this.socket.on('newGame', (msg: any) => {
            this.id = msg.sendId;
            this.status = msg.status;
            this.clicked = msg.specialMode
            router.push('/game/'+msg.sendId);
            this.socket.emit('triage', {id: this.id, player_id: this.player_id, specialMode: this.clicked, username: store.state.user.username});
        });

        this.socket.on('gameEnd', (data: any) => {
            this.status = data.status
            this.score_p1 = data.score_p1
            this.score_p2 = data.score_p2
            store.dispatch('putOnline');
            store.dispatch('watchGame', '0'); 
        }); 

        this.socket.on('pushGame', (data: any) => {
            let winner = data.score_p1 > data.score_p2 ? data.p1_id : data.p2_id;
            if (data.score_p1 == data.score_p2)
                winner = this.player_id;
            let data_test = {id_p1: data.p1_id, score_p1: data.score_p1, id_p2: data.p2_id, score_p2: data.score_p2, winner: winner, id_game: data.id};
            store.dispatch('putFullscore', data_test);
        })


        this.socket.on('countDown', (time: number) => {
            this.timer = time;
        });

        document.addEventListener('keydown', (e) => {      
            if (this.id != 0 && this.status=='play' && e.key == 'b') {
                this.bgColor = this.bgColor == 'transparent' ? 'rgb(75, 131, 204)' : 'transparent';}
            else {
                this.keyDown(e.key);
            }
        })
        
        if (window.addEventListener) {
            window.addEventListener('resize', (e) => {
                this.resizeCanvas(e);
            }, true)
        }

    }

    queue() {
        this.socket.emit('getGameId', { player_id: this.player_id, specialMode: this.clicked, username: store.state.user.username});
    }

    draw(data: any) {
        var canvas = document.getElementById('pong') as HTMLCanvasElement | null;
        if (canvas?.getContext) {
            var ctx = canvas.getContext('2d');
            if (ctx !== null){
                ctx.clearRect(0, 0, data.canvas_w * this.ratio, data.canvas_h* this.ratio);
                ctx.fillStyle = this.bgColor;
                ctx.fillRect(0, 0, data.canvas_w * this.ratio, data.canvas_h* this.ratio);
                ctx.fillStyle = 'rgb(200, 0, 0)';
                ctx.fillRect(0, data.pad1_y * this.ratio, data.pad_w * this.ratio, data.pad1_h * this.ratio);
                ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
                ctx.fillRect(data.canvas_w * this.ratio - data.pad_w * this.ratio , data.pad2_y * this.ratio, data.pad_w * this.ratio, data.pad2_h * this.ratio);
                ctx.beginPath();
                ctx.arc(data.ball_x * this.ratio, data.ball_y * this.ratio, data.ball_r * this.ratio, 0, Math.PI*2);
                ctx.fillStyle = 'rgb(201, 68, 68)';
                ctx.fill();
            }
        }
    }

    keyDown(e: any) {
        if (this.id != 0 && this.status=='play')
            this.socket.emit('keyDown', {id: this.id, player_id: store.state.user.id, key: e});
    }
}
</script>

<style>

.view-container p {
	text-align: center;
	font-size: 30px;
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

.lobby {
	margin-top: 80px;
}

.waiting {
    margin-top: 80px;
}

.start {
	margin-top: 80px;
}

.ended {
	margin-top: 80px;
}

.play {
	margin-top: 80px;
}

.pause {
	margin-top: 80px;
}

.canvas {
    top: 20%;
    font-size: 2.2vmin;
}

.queue {
    top: 24%;
    left: 32%;
    width: 8%;
    transition-duration: 0.4s;
    background-color: white; 
    color: grey; 
    border: 1px solid grey;
    text-shadow: 4px 4px 5px rgb(122, 100, 100);
    border-radius: 12px;
    font-style: oblique;
}

.special {
    top: 18%;
    left: 33%;
    width: 8%;
    transition-duration: 0.4s;
    background-color: white; 
    color: grey; 
    border: 1px solid grey;
    text-shadow: 4px 4px 5px rgb(122, 100, 100);
    border-radius: 12px;
    font-style: oblique;
}

.canvas-pong {
    border: 10px solid rgb(170, 170, 170);
    top: 25%;
    left: 21%;
    font-size: 2.2vmin;
    right: 50.8%;
}

.msg_afficher{
    top: 10%;
    color: aliceblue;
    left: 27%;
    font-family: "Trebuchet MS";
	text-decoration: underline;
	text-transform: uppercase;
	font-style: oblique;
	text-shadow: 4px 4px 5px rgb(122, 100, 100);
    font-size: 4.8vmin;
	color: rgba(255, 255, 255, 0.875);
}

.msg_fin{
    top: 40%;
    color: aliceblue;
    left: 24%;
    font-size: 10.2vmin;
}

.score{
    top: 18%;
    left: 27%;
    font-size: 3.2vmin;
    color: rgb(209, 209, 209);
}

.pause{
    top: 73%;
    left: 25%;
    font-size: 40px;
    color: grey;
}

.message_2{
    top: 75%;
    left: 22.5%;
    color: aliceblue;
}

.container {
  width: 100%; height: 100%
}

</style>