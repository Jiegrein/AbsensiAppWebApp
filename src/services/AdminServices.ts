import axios from 'axios';

// const baseUrl = 'https://absensiappwebapi.azurewebsites.net/api/v1/admin/';
const baseUrl = 'https://localhost:5001/api/v1/admin/';

const AdminService = {
    getExcelFromDates: async (dateFrom: Date , dateTo: Date ) => {
        const stringDate = new Date().toISOString().split('T')[0]
        var fileName = "Gajian - " + stringDate + ".xlsx";

        let from = new Date(Date.UTC(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate(), 0, 0, 0));
        let to = new Date(Date.UTC(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59));

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