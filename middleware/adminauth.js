const islogin=(req,res,next)=>{
    try {
        if(req.session.adminId){
           next()
        }else{
        res.redirect('/admin/login'); 
       }
    } catch (error) {
        console.log(error.message);
    }
}

const islogout=(req,res,next)=>{
    try {
    if(req.session.adminId){
    return res.redirect('/admin');
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
