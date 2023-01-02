// in src/App.js

import Services from './services/AdminServices';
import Indo from 'date-fns/locale/id';
import { useState } from 'react';
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import axios from 'axios';
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
// const baseUrl = 'https://absensiappwebapi.azurewebsites.net/api/v1/admin/';
const baseUrl = 'https://localhost:5001/api/v1/admin/';

export default function App() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  registerLocale('id', Indo);

  const handleDownloadClick = async () => {
    setLoading(true);
    const options = {
      onDownloadProgress: (progressEvent: ProgressEvent) => {
        const { loaded, total } = progressEvent;
        let percent = Math.floor((loaded * 100) / total);
        console.log(`${loaded}kb of ${total}kb | ${percent}%`);

        if (percent < 100) {
          setProgress(percent);
        }
      }
    }

    const stringDate = new Date().toISOString().split('T')[0]
    var fileName = "Gajian - " + stringDate + ".xlsx";

    let from = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0));
    let to = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59));

    await axios.post(baseUrl + "get-data-between-date", { dateFrom: from, dateTo: to, responseType: 'blob' }, options)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        setProgress(100)
        setTimeout(() => {
          setLoading(false)
          setProgress(0)
        }, 1000);
      });
  };

  return (
    <Container fluid={false}>
      <Row className="justify-content-center">
        <Col>
          <Form.Label>Tanggal Mulai</Form.Label>
          <DatePicker className='form-control' selected={startDate} onChange={(date: Date) => setStartDate(date)} locale="id" />
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col>
          <Form.Label>Tanggal Berakhir</Form.Label>
          <DatePicker className='form-control' selected={endDate} onChange={(date: Date) => setEndDate(date)} locale="id" />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Button variant="primary" type="submit" onClick={handleDownloadClick}>
            <i className="fa fa-home"></i>
            Download Laporan Gaji
          </Button>
        </Col>
      </Row>
      <Row className="mt-3">
          {loading && <ProgressBar now={progress} label={`${progress}%`} />}
      </Row>
      {/* <Form>
        <Row>
          <Col>
            <Form.Label>Email address</Form.Label>
            <Form.Control type="date" placeholder="Enter email" />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" />
          </Col>
        </Row>
        <Button variant="primary" type="submit">
          Submit
        </Button>
        <DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} />
        <DatePicker selected={endDate} onChange={(date: Date) => setEndDate(date)} />

        <button onClick={handleDownloadClick}>
          Download Gaji
        </button>
      </Form> */}
    </Container>
  )
}