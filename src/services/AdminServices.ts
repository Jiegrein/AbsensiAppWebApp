import axios from 'axios';

const baseUrl = 'https://absensi-app-web-api.herokuapp.com/api/v1/admin/';
// const baseUrl = 'https://localhost:5001/api/v1/admin/';

const fileName = "Gajian tanggal.xlsx";

const AdminService = {
    getExcelFromDates: async (dateFrom: Date , dateTo: Date ) => {
        const stringDate = new Date().toISOString().split('T')[0]
        var fileName = "Gajian - " + stringDate + ".xlsx";
        
        console.log("Old");
        console.log(dateFrom);
        console.log(dateTo);

        let from = new Date(dateFrom.toDateString());
        let to = new Date(dateTo.toDateString());
        
        console.log("New");
        console.log(from);
        console.log(to);

        await axios.request({
            method: 'POST',
            url: baseUrl + "get-data-between-date",
            data: { dateFrom: from, dateTo: to },
            responseType: 'blob'
        })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        });
    },
}

export default AdminService