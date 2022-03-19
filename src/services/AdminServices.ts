import axios from 'axios';

const baseUrl = 'https://absensi-app-web-api.herokuapp.com/api/v1/admin/';

const AdminService = {
    getExcelFromDates: async (dateFrom: Date, dateTo: Date) => {
        await axios.request({
            method: 'POST',
            url: baseUrl + "get-data-between-date",
            data: { dateFrom: dateFrom, dateTo: dateTo},
            responseType: 'blob',
            headers: { 
                'Access-Control-Allow-Origin' : '*',
                'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
              },
        })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', __filename);
            document.body.appendChild(link);
            link.click();
        });
    },
}

export default AdminService