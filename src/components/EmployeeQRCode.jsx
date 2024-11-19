import { QRCodeSVG } from "qrcode.react";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, QRCode, Segmented, Space, Input, Modal, Form } from "antd";
import { UserOutlined, RightOutlined, LeftOutlined } from "@ant-design/icons";

function doDownload(url, fileName) {
  const a = document.createElement("a");
  a.download = fileName;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
const downloadCanvasQRCode = () => {
  const canvas = document.getElementById("myqrcode")?.querySelector("canvas");
  if (canvas) {
    const url = canvas.toDataURL();
    doDownload(url, "QRCode.png");
  }
};
const downloadSvgQRCode = () => {
  const svg = document.getElementById("myqrcode")?.querySelector("svg");
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  doDownload(url, "QRCode.svg");
};

const EmployeeQRCode = () => {
  const [fetchAllow, setFetchAllow] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [renderType, setRenderType] = React.useState("canvas");
  const [qrdata, setQrdata] = useState("123456");
  const [isOpen, setIsOpen] = useState(false);
  const [accumulator, setAccumulator] = useState(0);
  const [current, setCurrent] = useState(1000);
  const onOpen = () => setIsOpen(true);

  const onClose = () => {
    setIsOpen(false);
    setInputValue("");
  };

  const handleChangeAcc = () => {
    setAccumulator((prev) => prev + 1000);
    setCurrent((prev) => prev + 1000);
  };

  const handleChangeCurrent = () => {
    setAccumulator((prev) => prev - 1000);
    setCurrent((prev) => prev - 1000);
  };
  const { data, isError, isLoading } = useQuery({
    queryKey: ["machineData"],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3001/admin/table`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    },
    enabled: !!fetchAllow,
  });
  if (isError) {
    return <p>error fetching data</p>;
  }
  const sliced = data?.slice(accumulator, current);

  const printQRCode = () => {
    window.print();
  };
  const handleChange = (e) => {
    const value = e.target.value;
    setQrdata(value);
  };
  const handleChangePassword = (e) => {
    const value = e.target.value;
    setInputValue(value);
  };
  const validat = () => {
    if (inputValue === "sbg@123") {
      onClose();
      setFetchAllow(true);
    } else {
      console.log("lllllllll");
    }
  };
  return (
    <div className="font-semibold">
      <Modal
        open={isOpen}
        onCancel={onClose}
        centered
        footer={null}
        width={500}
        className="font-semibold"
        style={{ margin: "5vh 5vw", direction: "rtl" }}
      >
        <Space direction="vertical" className="w-full space-y-5">
          <span>أدخل الرقم السري</span>
          <Form onFinish={validat}>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input
                size="large"
                placeholder="أكتب الرقم السري"
                className="placeholder:text-sm"
                value={inputValue}
                onChange={handleChangePassword}
              />
            </Form.Item>
            <Button
              className="w-full"
              size="large"
              disabled={inputValue !== "sbg@123"}
              onClick={validat}
              type="primary"
            >
              Submit
            </Button>
          </Form>
        </Space>
      </Modal>
      <Input
        size="large"
        placeholder="أكتب لإنشاء الباركود"
        prefix={<UserOutlined />}
        dir="rtl"
        onChange={handleChange}
      />
      <Space id="myqrcode" direction="vertical">
        <Segmented
          options={["canvas", "svg"]}
          value={renderType}
          onChange={setRenderType}
        />
        <div>
          <QRCode
            type={renderType}
            value={qrdata}
            bgColor="#fff"
            style={{
              marginBottom: 16,
            }}
          />
          <span>{qrdata}</span>
        </div>
        <Button
          type="primary"
          onClick={
            renderType === "canvas" ? downloadCanvasQRCode : downloadSvgQRCode
          }
          className="w-full"
        >
          Download
        </Button>
      </Space>
      {/* <div className="font-semibold p-10"> */}
      <h2 className="mt-2">Generate Employees QR</h2>
      <div className="grid grid-cols-3 items-center">
        <button
          className="bg-emerald-500 rounded p-2 m-2"
          onClick={printQRCode}
        >
          Print
        </button>
        <div className="flex justify-around gap-5">
          <Button
            type="primary"
            icon={<LeftOutlined />}
            onClick={handleChangeCurrent}
          />
          <span>{accumulator}</span>
          <span>{current}</span>
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={handleChangeAcc}
          />
        </div>

        <button
          className="bg-emerald-500 rounded p-2 m-2"
          onClick={onOpen}
          // onClick={() => setFetchAllow(true)}
        >
          {isLoading ? "Loading data ..." : "fetch data"}
        </button>
      </div>
      {data && data?.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center">
          {/* <div className="mt-20"> */}
          {sliced?.map((item, index) => (
            <div key={index} className="m-5 items-center">
              {/* <div key={index} className="m-5 items-center flex flex-col my-[720px]"> */}
              <QRCodeSVG value={item.emp_no} size={128} />
              <p className="mt-1">{item.emp_no}</p>
            </div>
          ))}
        </div>
      ) : (
        "Click to fetch data"
      )}
    </div>
  );
};

export default EmployeeQRCode;
