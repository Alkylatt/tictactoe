let div_game = document.getElementById('div_game');
for(let i=0;i < 3;i++) {
	let new_row = document.createElement('div');
	div_game.appendChild(new_row);
	
	for(let j=0;j < 3;j++) {
		let new_div = document.createElement('div');
		new_div.className = 'empty';
		let index_temp = 3*i + j;
		new_div.setAttribute("onclick","click_input(" + index_temp + ");");
		new_row.appendChild(new_div);
	}
}

let game_grid = document.querySelectorAll('#div_game > div > div'); // html element
let game_status = [0,0,0,0,0,0,0,0,0]; // range: -1, 0, 1

let isPlayersTurn = true;
let playerIsCircle = true;
let gameEnded = false;

function click_input(i) {
	if(!isPlayersTurn || gameEnded) return;
	isPlayersTurn = false;
	game_status[i] = 1;
	if(playerIsCircle) game_grid[i].innerText = 'O';
	else game_grid[i].innerText = 'X';
	
	let winner = check_win(game_status);
	if(winner === 1) alert('You won');
	else if(winner === -1) alert('You lost');
	if(winner !== 0) { gameEnded = true; return; }
	
	if(!gameEnded) engine(game_status);
	
	winner = check_win(game_status);
	if(winner === 1) alert('You won');
	else if(winner === -1) alert('You lost');
	if(winner !== 0) gameEnded = true;
}

function engine(game) {
	// game: current game status (0~8, with value of -1, 0 or 1)
	
	// win, if there is an immediate win
	let eval = evaluate_win_rate(game, -1);
	console.log('eval:' + eval);
	if(eval[0][0] === 0 && eval[0][1] === 1) {
		let move = eval[1];
		game[move] = -1;
		if(playerIsCircle) game_grid[move].innerText = 'X';
		else game_grid[move].innerText = 'O';
		
		isPlayersTurn = true;
		return;
	}
	
	// defend, block immediate wins
	let eval_defend = evaluate_win_rate(game, 1);
	console.log('eval_def:' + eval_defend);
	if(eval_defend[0][0] === 1 && eval_defend[0][1] === 0) {
		let move = eval_defend[1];
		game[move] = -1;
		if(playerIsCircle) game_grid[move].innerText = 'X';
		else game_grid[move].innerText = 'O';
		
		isPlayersTurn = true;
		return;
	}
	
	// other moves
	// ###### [temporary] just make a move
	for(let i=0;i < 9;i++) {
		if(game[i] === 0) {
			game[i] = -1;
			if(playerIsCircle) game_grid[i].innerText = 'X';
			else game_grid[i].innerText = 'O';
			
			isPlayersTurn = true;
			return;
		}
	}
	
	
	alert('uncaught condition within engine(), \n(though it\'s probably just a draw)');
}

function evaluate_win_rate(game, turn) {
	// turn: indicates who is next to move
	let res = [[0,0]];
	
	// check immediate wins (returns: [player_win_rate, engine_win_rate], move_to_win)
	let empty_index, occupied_count;
	
	// check horizontal
	for(let i=0;i <= 8;i+=3) {
		occupied_count = 0; empty_index = -1;
		if (game[i]===turn) { occupied_count++; } else if(game[i]===0) { empty_index=i; }
		if (game[i+1]===turn) { occupied_count++; } else if(game[i+1]===0) { empty_index=i+1; }
		if (game[i+2]===turn) { occupied_count++; } else if(game[i+2]===0) { empty_index=i+2; }
		
		if(occupied_count === 2 && empty_index !== -1) {
			if(turn === -1) { res[0][0] = 0; res[0][1] = 1; } // engine
			else { res[0][0] = 1; res[0][1] = 0; } // player
			res[1] = empty_index;
			return res;
		}
	}
	

	// check vertical
	for(let i=0;i <= 2;i++) {
		occupied_count = 0; empty_index = -1;
		if (game[i]===turn) { occupied_count++; } else if(game[i]===0) { empty_index=i; }
		if (game[i+3]==turn) { occupied_count++; } else if(game[i+3]===0) { empty_index=i+3; }
		if (game[i+6]==turn) { occupied_count++; } else if(game[i+6]===0) { empty_index=i+6; }
		
		if(occupied_count === 2 && empty_index !== -1) {
			if(turn === -1) { res[0][0] = 0; res[0][1] = 1; } // engine
			else { res[0][0] = 1; res[0][1] = 0; } // player
			res[1] = empty_index;
			return res;
		}
	}


	// check diagonal
	for(let i=0;i <= 2;i+=2) {
		occupied_count = 0; empty_index=-1;
		if (game[i]===turn) { occupied_count++; } else if(game[i]===0) { empty_index=i; }
		if (game[4]===turn) { occupied_count++; } else if(game[4]===0) { empty_index=4; }
		if (game[8-i]===turn) { occupied_count++; } else if(game[8-i]===0) { empty_index=8-i; }
		
		if(occupied_count === 2 && empty_index !== -1) {
			if(turn === -1) { res[0][0] = 0; res[0][1] = 1; } // engine
			else { res[0][0] = 1; res[0][1] = 0; } // player
			res[1] = empty_index;
			return res;
		}
	}
	
	
	
	// check possible win outcomes
	let positive = 0,
		negative = 0;
	// check horizontal wins
	for(let i=0;i <= 8;i+=3) {
		if(game[i]!=-1 && game[i+1]!=-1 && game[i+2]!=-1) positive++;
		if(game[i]!=1 && game[i+1]!=1 && game[i+2]!=1) negative++;
	}
	// check vertical wins
	for(let i=0;i <= 2;i++) {
		if(game[i]!=-1 && game[i+3]!=-1 && game[i+6]!=-1) positive++;
		if(game[i]!=1 && game[i+3]!=1 && game[i+6]!=1) negative++;
	}
	// check diagonal wins
	if(game[0]!=-1 && game[4]!=-1 && game[8]!=-1) positive++;
	if(game[0]!=1 && game[4]!=1 && game[8]!=1) negative++;
	if(game[2]!=-1 && game[4]!=-1 && game[6]!=-1) positive++;
	if(game[2]!=1 && game[4]!=1 && game[6]!=1) negative++;
	
	res[0][0] = positive / (positive + negative);
	res[0][1] = negative / (positive + negative);
	return res;
} // end of evalueate_win_rate()



function check_win(game) {
	for(let player=-1;player <= 1;player+=2) {
		let count;
		// check horizontal
		for(let i=0;i <= 8;i+=3) {
			count = 0;
			if(game[i] === player) count++;
			if(game[i+1] === player) count++;
			if(game[i+2] === player) count++;
			if(count === 3) return player;
		}
		
		// check vertical
		for(let i=0;i <= 2;i++) {
			count = 0;
			if(game[i] === player) count++;
			if(game[i+3] === player) count++;
			if(game[i+6] === player) count++;
			if(count === 3) return player;
		}
		
		// check diagonal
		for(let i=0;i <= 2;i+=2) {
			count = 0;
			if(game[i] === player) count++;
			if(game[4] === player) count++;
			if(game[8-i] === player) count++;
			if(count === 3) return player;
		}
	}
	
	return 0; // if no one won
}