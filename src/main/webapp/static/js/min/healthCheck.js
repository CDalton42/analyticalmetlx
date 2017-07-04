var HealthChecker=function(){var a={},h=0,n=function(l,g,e){l in a||(a[l]=timedQueue(3E5));a[l].enqueue({instant:(new Date).getTime(),duration:e,success:g});t()},m=function(a){$("#healthStatus").attr("low",a?11:4).attr("high",a?12:8).attr("optimum",a?13:10)},k=function(){var a=(new Date).getTime(),g=p(),e="/reportLatency";"latency"in g&&(g=g.latency,e=sprintf("%s?minLatency=%s&maxLatency=%s&meanLatency=%s&sampleCount=%s",e,g.min,g.max,g.average,g.count));m(!0);$.ajax(e,{method:"GET",success:function(f){if(_.includes(f,
"<html"))window.location.href=e;else{m(!1);var c=new Date,b=JSON.parse(f);f=parseInt(b.serverWorkTime);var u=((new Date).getTime()-a-f)/2,b=b.serverTime;h=c.getTime()-(b+u);n("serverResponse",!0,f);n("latency",!0,u);_.delay(k,2E4)}},dataType:"text",error:function(){m(!0);n("latency",!1,((new Date).getTime()-a)/2);_.delay(k,2E4)}})},t=_.throttle(function(){var a=q(1E3),g=p();HealthCheckViewer.refreshDisplays(a,g)},1E3),r=function(a){a?k():_.delay(k,2E4)},q=function(l){return _.mapValues(a,function(a){var e=
{};_.forEach(a.items(),function(a){var c=Math.floor(a.instant/l)*l,b=e[c],b=b?b:{count:0,avg:void 0,successCount:0,min:void 0,max:void 0,instant:c};b.count+=1;a.success&&(b.successCount+=1);if(void 0==b.min||b.min>a.duration)b.min=a.duration;if(void 0==b.max||b.max<a.duration)b.max=a.duration;b.avg=void 0==b.avg?a.duration:(a.duration-b.avg)/b.count+b.avg;e[c]=b});return _.values(e)})},p=function(){return _.mapValues(a,function(a,g){var e=a.items(),f=e.length,c=_.map(e,"duration");if(0<f)return{name:g,
count:f,max:_.max(c),min:_.min(c),average:_.mean(c),recent:_.mean(_.takeRight(c,10)),successful:0==f||e[f-1].success,successRate:_.countBy(e,"success")[!0]/f}})};$(function(){r(!0)});return{getTimeOffset:function(){return h},getServerTime:function(){return new Date((new Date).getTime()+h)},check:k,resumeHealthCheck:r,pauseHealthCheck:function(){},addMeasure:n,getMeasures:function(){return _.mapValues(a,function(a){return a.items()})},getAggregatedMeasures:q,describeHealth:p}}(),augmentArguments=function(a){a[_.size(a)]=
(new Date).getTime();return a},serverResponse=function(a){HealthChecker.addMeasure(a.command,a.success,a.duration);if("instant"in a){var h=a.instant,h=((new Date).getTime()-h-a.duration)/2;HealthChecker.addMeasure("latency",a.success,h)}"success"in a&&0==a.success&&(console.log(a),errorAlert(sprintf("error in %s",a.command),a.response||"Error encountered"))},HealthCheckViewer=function(){var a=!1,h={};$("#healthCheckListing");var n={},m={},k=!1;$(function(){h=$("#healthCheckListing");n=h.find(".healthCheckItem").clone();
h.empty()});var t=function(a){return _.filter(_.map(a,function(a){return{x:a.instant,y:a.count-a.successCount}}),function(a){return 0<a.y})},r=function(a){return _.map(a,function(a){return{x:a.instant,y:a.avg}})},q=function(a){return _.map(a,function(a){return{x:a.instant,y:a.min}})},p=function(a){return _.map(a,function(a){return{x:a.instant,y:a.max}})},l=function(a){var b=(new Date).getTime();return _.map(a,function(a){a.instant=(a.instant-b)/1E3;return a})},g=function(a,b){if(!(a in m)){var d=
l(b),c=n.clone(),e=$("<canvas />").addClass("healthCheckCanvas").css({"margin-top":"-20px"});c.html(e);h.append(c);c={title:{display:!0,text:a,padding:20},legend:{display:!1},scales:{yAxes:[{id:"durationAxis",scaleLabel:{display:!0,labelString:"time taken (ms)"},type:"linear",stacked:!1,display:!0,position:"left",ticks:{}},{id:"errorAxis",scaleLabel:{display:!0,labelString:"errors"},type:"linear",stacked:!0,display:!0,position:"right",ticks:{beginAtZero:!0,min:0,stepSize:1}}],xAxes:[{type:"linear",
position:"bottom",scaleLabel:{display:!0,labelString:"time (seconds)"},ticks:{beginAtZero:!0}}]},hover:{mode:"x-axis"},elements:{line:{fill:!1},bar:{fill:!0}}};d={type:"bar",data:{labels:_.map(d,"instant"),datasets:[{type:"line",label:"error count",data:t(d),fill:!0,borderColor:"rgba(0,0,0,0.5)",backgroundColor:"rgba(255,0,0,0.3)",borderWidth:1,pointRadius:0,pointHoverRadius:3,pointHitRadius:5,lineTension:0,stepped:!0,yAxisID:"errorAxis"},{label:"min",type:"line",data:q(d),fill:!0,pointRadius:0,pointHoverRadius:3,
pointHitRadius:5,borderColor:"rgba(155,197,61,1)",backgroundColor:"rgba(155,197,61,0.3)",borderWidth:1,lineTension:.1,yAxisID:"durationAxis"},{label:"avg",type:"line",data:r(d),fill:!0,pointRadius:0,pointHoverRadius:3,pointHitRadius:5,borderColor:"rgba(250,121,33,1)",backgroundColor:"rgba(250,121,33,0.3)",borderWidth:1,lineTension:.1,yAxisID:"durationAxis"},{label:"max",type:"line",data:p(d),fill:!0,pointRadius:0,pointHoverRadius:3,pointHitRadius:5,borderColor:"rgba(229,89,52,1)",backgroundColor:"rgba(229,89,52,0.3)",
borderWidth:1,lineTension:.1,yAxisID:"durationAxis"}]},options:c};e=new Chart(e[0].getContext("2d"),d);console.log("New chart",a);m[a]=e}},e=function(a){var b=10;a.latency&&(b-=Math.min(8,a.latency.recent/100));a.render&&(b-=Math.min(8,a.render.recent/20));$(".meters").css("background-color",function(){return _.some(["latency","serverResponse"],function(b){return!(b in a)||void 0===a[b]||1>a[b].successRate})?"red":"transparent"}());var c=k;k=_.every(["latency","serverResponse"],function(b){return b in
a&&void 0!==a[b]&&a[b].successful});c!=k&&blit();$("#healthStatus").prop({max:13,low:4,high:8,min:0,value:b})},f={},c=function(a){return a in f?f[a]:f[a]=$(a)},b=function(b,f){WorkQueue.enqueue(function(){e(f)});if(a){var d=f.latency;void 0!=d?(c(".healthCheckSummaryLatencyContainer").show(),c(".latencyAverage").text(parseInt(d.average)),c(".worstLatency").text(parseInt(d.min)),c(".bestLatency").text(parseInt(d.max)),c(".successRate").text(parseInt(100*d.successRate)),200<d.average?c(".latencyHumanReadable").text("poor"):
50<d.average?c(".latencyHumanReadable").text("moderate"):20<d.average&&c(".latencyHumanReadable").text("good")):c(".healthCheckSummaryLatencyContainer").hide();d=f.serverResponse;void 0!=d?(c(".heathCheckSummaryServerResponseContainer").show(),d=d.average,c(".serverResponseAverage").text(parseInt(d)),d=2<d?"poor":"good",c(".serverResponseHumanReadable").text(d)):c(".heathCheckSummaryServerResponseContainer").hide();_.forEach(b,function(a,b){var c=l(a);b in m||g(b,a);var d=m[b];d.data.datasets[0].data=
t(c);d.data.datasets[1].data=q(c);d.data.datasets[2].data=r(c);d.data.datasets[3].data=p(c);d.update()})}};return{resume:function(){a=!0;var c=HealthChecker.getAggregatedMeasures(1E3),e=HealthChecker.describeHealth();b(c,e);_.forEach(c,function(a,b){g(b,a)})},pause:function(){a=!1},refreshDisplays:b,healthy:function(){return k}}}();
