var site = "https://test.hentaiheroes.com"

var mockedData={};
mockedData.teamBattles=[];
mockedData.missions={};


function getRawMissions(delaySecondsNum=0){
	if(delaySecondsNum!=0){
		delaySecondsNum = parseInt(delaySecondsNum);
		mockedData.missions.ma = [];
		addHoldTime(mockedData.missions, delaySecondsNum*1000);
		console.log("missions script delayed by ", delaySecondsNum, "s");
	}
	mockedData.rawMissions = request("GET", "/activities.html");
	setTimeout(genMissionData, 3000);
}

function request(type, p1){
	var isGet = type == "GET";
	var bigParams = {
		type: type,
		url: site + isGet? p1 : "/ajax.php",
		dataType: "json",
		}
		if(!isGet) bigParams.params = p1;
	return $.ajax();
}

function genMissionData(){
	var ind1 = mockedData.rawMissions.indexOf("var player_missions");
	var str1 = mockedData.rawMissions.substring(ind1);
	ind1 = str1.indexOf("}];");
	var jsonValue = JSON.parse(str1.substring(4, ind1+2));
	mockedData.missions.ma = [];
	var totalEstmTime = 0;
	var msNotStartedCount = 0;
	for(var i = 0; i< jsonValue.length; i++){
		var m = jsonValue[i];
		var gm = {id: m.id_member_mission, duration: parseInt(m.duration), state: m.state, title: m.mission.title_raw};
		mockedData.missions.ma.push(gm);
		if(gm.state == "not_started"){
			totalMissionsTime+=gm.duration;
			msNotStartedCount++;
		}
	}
	var timeStr = (totalEstmTime>3600? Math.floor(totalEstmTime/3600) + "h": "") + (totalEstmTime%3600>60? Math.floor((totalEstmTime%3600)/60) + "m": "") + (totalEstmTime%60)+"s";
	console.log("Mission getted: ", msNotStartedCount, "/", jsonValue.length, ";\nestimate time ended minimum for &&", timeStr);
}

function doMissions(){
	if(!mockedData.missions.ma || mockedData.missions.nextAtInt > new Date())return;
	for(var i = 0; i< mockedData.missions.ma.length; i++){
		var m = mockedData.missions.ma[i];
		if(m.state != "not_started") {
			if(i = mockedData.missions.ma.length-1)
				addHoldTime(mockedData.missions, 120000000000000);
			continue;
		}
		addHoldTime(mockedData.missions, m.duration*1000);
		request("POST", {action: "missions_start",
			id_member_mission: m.id});
		break;
	}
}

function teamBattlesAdd(battle, delaySecondsNum=0){
	if(delaySecondsNum!= 0 || battle.delay){
		delaySecondsNum = delaySecondsNum!=0 ? delaySecondsNum : battle.delay
		delaySecondsNum = parseInt(delaySecondsNum);
		battle.delay = 0; delete battle.delay;
		addHoldTime(battle, battledelaySecondsNum*1000);
		console.log("The TeamBattle delayed to add by ", delaySecondsNum, "s");
	}
	mockedData.teamBattles.push(battle);
}

function doTeamBattles(){
	mockedData.teamBattles.forEach(tb => {
		if(tb.nextAt>new Date()) return;
		request("POST", tb.rqParams);
	});
}

function periodTriggerTasks(){
	doMissions();
	doTeamBattles();
	setTimeout( periodTriggerTasks, 4000);
}

function addTNow(ticksNum){
	return new Date().getTime() + ticksNum;
}

function addHoldTime(obj, ticksNum){
	obj.nextAtInt = addTNow(ticksNum);
	obj.nextAt = timeString(obj.nextAtInt);
}

function timeString(timeInt){
	function addZero(i) {
		if (i < 10) {i = "0" + i}
		return i;
	}
	  
	//const timeInt = new Date();
	let h = addZero(timeInt.getUTCHours());
	let m = addZero(timeInt.getUTCMinutes());
	let s = addZero(timeInt.getUTCSeconds());
	return h + ":" + m + ":" + s;
}