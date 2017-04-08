module.exports = {
    res : null,
    use : function(response) {
        this.res = response;
    },
    checkError : function(err) {
        if (err) {
            this.res.json({ status : 'error', error : err });
        }
    },
    success : function(data) {
        this.res.json({ status : 'ok', data : data });
    }
}
