const islogin=(req,res,next)=>{
    try {
        if(req.session.userid){
           next()
        }else{
        res.redirect('/login'); 
       }
    } catch (error) {
        console.log(error.message);
    }
}

const islogout=(req,res,next)=>{
    try {
    if(req.session.userid){ 
    return res.redirect('/');
    }else{
        next()
    }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    islogin,
    islogout
}
