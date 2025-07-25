api 명세

[CLIENT -> SERVER]
event name : HITfromCLIENT
{
    argumentType : 'guitar' ,, ...
    key : '어떤 음?',
}

[SERVER -> CLIENT]
event name: HITfromSERVER
{
    argumentTYpe : 'guitar',
    key : '어떤 음?'
}

[CLIENT -> SERVER]
event name : ACCURACYfromCLIENT
{
    argumentType : 'guitar',
    key : '어떤음?'
    accuracy : 'perfect', 'good', ... , 'bad'
}

[SERVER -> CLIENT]
event name : ACCURACYfromSERVER
{
    argumentType : 'guitar',
    key : '어떤 음?'
    accuracy : 'perfect', 'good', ... (클라이언트에서 판단 후 서버로 보냄)
}


[CLIENT -> SERVER]
event name : READY
{
    
}
function : 모든 유저가 준비가 되었다는 요청을 서버로 보냄, 서버는 이를 받고 METRONOMESTART를 보낼 준비를함.


[SERVER -> CLIENT]
event name : METRONOMESTART
{
    startTime: 메트로놈 시작시간
}
function : 메트로놈 시작시간을 클라이언트에게 알리고 예약된 시간에 메트로놈을 시작하도록함.

[CLIENT -> SERVER]
event name: 


0. READY요청을 클라이언트로부터 받으면 서버는 METRONOMESTART 이벤트를 모든 클라이언트로 보내서 메트로놈이 시작하도록한다.
1. HITfromCLIENT를 송신 받고 HITfromSERVER를 브로드 캐스팅
2. ACCURACYfromCLIENT 를 송신 받고 HITfromCLIENT를 브로드 캐스팅
3. 서버에서는 전체 정확도를 계산하고 있어야함.
3-1. 정확도 계산 로직은 어떻게할까? 

닉네임 설정 -> 입장 -> 곡 선택 다수결 -> 세션 선택 선착순 -> 바로 시작