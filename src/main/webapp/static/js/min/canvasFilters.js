var CanvasFilter=function(){var f=function(a,c){if(void 0!=c){var b=(new Date).getTime(),d=a.getContext("2d"),e=d.getImageData(0,0,a.width,a.height);d.putImageData(c(e),0,0);console.log("filtered:",(new Date).getTime()-b)}},l=function(a,c){for(var b=a.data,d=0;d<b.length;d+=4){var e=c(b[d],b[d+1],b[d+2],b[d+3]);b[d]=e.r;b[d+1]=e.g;b[d+2]=e.b;b[d+3]=e.a}return a},v=function(a,c){return function(b){var d=Math.round(Math.sqrt(a.length)),e=Math.floor(d/2),g=b.data,m=b.width;b=b.height;for(var f=$("<canvas/>")[0].getContext("2d").createImageData(m,
b),n=f.data,l=c?1:0,p=0;p<b;p++)for(var q=0;q<m;q++){for(var v=p,x=q,r=4*(p*m+q),y=0,z=0,A=0,w=0,t=0;t<d;t++)for(var u=0;u<d;u++){var h=v+t-e,k=x+u-e;0<=h&&h<b&&0<=k&&k<m&&(h=4*(h*m+k),k=a[t*d+u],y+=g[h]*k,z+=g[h+1]*k,A+=g[h+2]*k,w+=g[h+3]*k)}n[r]=y;n[r+1]=z;n[r+2]=A;n[r+3]=w+l*(255-w)}return f}},x=function(a){return l(a,function(a,b,d,e){a=.212*a+.7152*b+.0722*d;return{r:a,g:a,b:a,a:e}})},B=function(a){return function(c){return l(c,function(b,d,c,g){return{r:b+a,g:d+a,b:c+a,a:g}})}},C=function(a){return function(c){return l(c,
function(b,d,c,g){b=.212*b+.7152*d+.0722*c>=a?255:0;return{r:b,g:b,b:b,a:g}})}},D=function(a,c,b){var d=void 0==a?1:a,e=void 0==c?1:c,g=void 0==b?1:b;return function(a){return l(a,function(a,b,c,f){return{r:a*d,g:b*e,b:c*g,a:f}})}},E=function(a){if(0<a)return v(Array.apply(null,Array(a)).map(function(c,b){return 1/a}))};return{greyscale:function(a){f(a,x)},threshold:function(a,c){f(a,C(c))},adjustTone:function(a,c){f(a,B(c))},sharpen:function(a){f(a,v([0,-1,0,-1,5,-1,0,-1,0]))},blur:function(a,c){f(a,
E(c))},adjustColors:function(a,c,b,d){f(a,D(c,b,d))}}}();