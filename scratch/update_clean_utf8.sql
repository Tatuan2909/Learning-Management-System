USE [lms_db];
GO
UPDATE dbo.departments SET name = N'Khoa Công nghệ Thông tin', dean_name = N'PGS. TS. Nguyễn Văn A', office_location = N'Nhà A2 - Tầng 3, Khu Hiệu bộ', description = N'Đào tạo kỹ sư, cử nhân Công nghệ Thông tin, Kỹ thuật Phần mềm và Trí tuệ Nhân tạo chất lượng cao.' WHERE id = '11110000-0000-0000-0000-000000000001';
GO
UPDATE dbo.departments SET name = N'Khoa Điện - Điện tử & Viễn thông', dean_name = N'TS. Lê Quang Huy', office_location = N'Nhà C1 - Tầng 2', description = N'Đào tạo các lĩnh vực Viễn thông, Tự động hóa, Vi mạch bán dẫn và Robot thông minh.' WHERE id = '11110000-0000-0000-0000-000000000002';
GO
UPDATE dbo.departments SET name = N'Khoa Kinh tế & Quản trị Kinh doanh', dean_name = N'PGS. TS. Phạm Thu Trang', office_location = N'Nhà B1 - Tầng 4', description = N'Đào tạo cử nhân Quản trị Kinh doanh số, Thương mại Điện tử và Tài chính Công nghệ (Fintech).' WHERE id = '11110000-0000-0000-0000-000000000003';
GO
UPDATE dbo.departments SET name = N'Khoa Ngoại ngữ & Hợp tác Quốc tế', dean_name = N'TS. Đỗ Hoàng Nam', office_location = N'Nhà D2 - Tầng 1', description = N'Đào tạo cử nhân Ngôn ngữ Anh khoa học kỹ thuật, Ngôn ngữ Nhật thương mại & CNTT.' WHERE id = '11110000-0000-0000-0000-000000000004';
GO
UPDATE dbo.departments SET name = N'Khoa Cơ khí & Kỹ thuật Chế tạo', dean_name = N'PGS. TS. Hoàng Quốc Việt', office_location = N'Nhà Xưởng Cơ khí C3', description = N'Đào tạo kỹ sư Cơ điện tử, Kỹ thuật Cơ khí chính xác và Kỹ thuật Ô tô điện tử.' WHERE id = '11110000-0000-0000-0000-000000000005';
GO
UPDATE dbo.departments SET name = N'Khoa Kỹ thuật Xây dựng & Giao thông', dean_name = N'TS. Đặng Thanh Tùng', office_location = N'Nhà E1 - Tầng 2', description = N'Đào tạo kỹ sư Xây dựng dân dụng, Xây dựng cầu đường và Đô thị thông minh (Smart City).' WHERE id = '11110000-0000-0000-0000-000000000006';
GO
UPDATE dbo.departments SET name = N'Khoa Công nghệ Hóa học & Vật liệu', dean_name = N'PGS. TS. Bùi Thị Mai Hương', office_location = N'Khu Thí nghiệm Hóa học B3', description = N'Nghiên cứu và đào tạo Công nghệ Hóa học, Kỹ thuật Hóa sinh và Khoa học Vật liệu tiên tiến.' WHERE id = '11110000-0000-0000-0000-000000000007';
GO
UPDATE dbo.departments SET name = N'Khoa Công nghệ Sinh học & Môi trường', dean_name = N'TS. Trịnh Thúy Hà', office_location = N'Nhà Sinh học D3', description = N'Đào tạo kỹ sư Công nghệ Sinh học y dược, Vi sinh thực phẩm và Kỹ thuật Quản lý môi trường.' WHERE id = '11110000-0000-0000-0000-000000000008';
GO
UPDATE dbo.departments SET name = N'Khoa Luật & Quản trị Công', dean_name = N'TS. Phan Văn Khiêm', office_location = N'Nhà Hiệu bộ A1 - Tầng 5', description = N'Đào tạo cử nhân Luật Kinh tế quốc tế, Luật Sở hữu trí tuệ công nghệ và Quản lý công.' WHERE id = '11110000-0000-0000-0000-000000000009';
GO
UPDATE dbo.departments SET name = N'Khoa Y - Dược & Khoa học Sức khỏe', dean_name = N'GS. TS. Vũ Đình Chính', office_location = N'Bệnh viện Thực hành - Tòa Y tế', description = N'Đào tạo bác sĩ Y đa khoa, Dược sĩ đại học và Kỹ thuật viên xét nghiệm y sinh.' WHERE id = '11110000-0000-0000-0000-000000000010';
GO
UPDATE dbo.departments SET name = N'Khoa Thiết kế Mỹ thuật & Truyền thông số', dean_name = N'ThS. Họa sĩ Trần Quốc Huy', office_location = N'Studio Nghệ thuật F1', description = N'Đào tạo Cử nhân Thiết kế Đồ họa số, Thiết kế UI/UX Trải nghiệm người dùng và Kỹ xảo hoạt hình 3D.' WHERE id = '11110000-0000-0000-0000-000000000011';
GO
UPDATE dbo.departments SET name = N'Khoa Khoa học Cơ bản & Toán Ứng dụng', dean_name = N'PGS. TS. Nghiêm Xuân Toán', office_location = N'Nhà B2 - Tầng 3', description = N'Giảng dạy các bộ môn Toán cao cấp, Vật lý đại cương, Xác suất thống kê và Toán Tin ứng dụng.' WHERE id = '11110000-0000-0000-0000-000000000012';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Phần mềm (Software Engineering)', degree_level = N'Đại học Chính quy', description = N'Chương trình đào tạo chuyên sâu về kiến trúc phần mềm, web, mobile và DevOps.' WHERE id = '22220000-0000-0000-0000-000000000001';
GO
UPDATE dbo.majors SET name = N'Trí tuệ Nhân tạo & Khoa học Dữ liệu', degree_level = N'Chất lượng cao', description = N'Đào tạo chuyên gia Deep Learning, Computer Vision, NLP và AI Engineering.' WHERE id = '22220000-0000-0000-0000-000000000002';
GO
UPDATE dbo.majors SET name = N'Khoa học Máy tính', degree_level = N'Đại học Chính quy', description = N'Nghiên cứu cấu trúc dữ liệu thuật toán, xử lý dữ liệu lớn và thuật toán học máy.' WHERE id = '22220000-0000-0000-0000-000000000003';
GO
UPDATE dbo.majors SET name = N'An toàn Thông tin (Cybersecurity)', degree_level = N'Đại học Chính quy', description = N'An ninh mạng, bảo mật hệ thống, mật mã học và kiểm thử xâm nhập (PenTest).' WHERE id = '22220000-0000-0000-0000-000000000004';
GO
UPDATE dbo.majors SET name = N'Hệ thống Thông tin Quản lý', degree_level = N'Đại học Chính quy', description = N'Phân tích nghiệp vụ (BA), quản trị cơ sở dữ liệu và triển khai ERP doanh nghiệp.' WHERE id = '22220000-0000-0000-0000-000000000005';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Điện tử - Viễn thông', degree_level = N'Kỹ sư', description = N'Mạng 5G/6G, xử lý tín hiệu số, thiết kế ăng-ten và truyền thông quang.' WHERE id = '22220000-0000-0000-0000-000000000006';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Điều khiển & Tự động hóa', degree_level = N'Kỹ sư', description = N'Hệ thống điều khiển SCADA, PLC, IoT công nghiệp và tự động hóa nhà máy thông minh.' WHERE id = '22220000-0000-0000-0000-000000000007';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Robot & Hệ thống thông minh', degree_level = N'Chất lượng cao', description = N'Cơ điện tử, cánh tay robot công nghiệp và phương tiện tự hành (AGV).' WHERE id = '22220000-0000-0000-0000-000000000008';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Vi mạch & Bán dẫn (Semiconductor)', degree_level = N'Kỹ sư', description = N'Thiết kế vi mạch tích hợp VLSI, IC bán dẫn và kiểm thử chip công nghệ cao.' WHERE id = '22220000-0000-0000-0000-000000000009';
GO
UPDATE dbo.majors SET name = N'Quản trị Kinh doanh số', degree_level = N'Cử nhân', description = N'Khởi nghiệp kinh doanh số, quản trị chiến lược chuyển đổi số trong doanh nghiệp.' WHERE id = '22220000-0000-0000-0000-000000000010';
GO
UPDATE dbo.majors SET name = N'Thương mại Điện tử (E-Commerce)', degree_level = N'Cử nhân', description = N'Kinh doanh đa kênh Omnichannel, digital marketing và phân tích dữ liệu khách hàng.' WHERE id = '22220000-0000-0000-0000-000000000011';
GO
UPDATE dbo.majors SET name = N'Công nghệ Tài chính (Fintech)', degree_level = N'Chất lượng cao', description = N'Thanh toán điện tử, công nghệ Blockchain, phân tích thuật toán giao dịch tài chính.' WHERE id = '22220000-0000-0000-0000-000000000012';
GO
UPDATE dbo.majors SET name = N'Kế toán & Kiểm toán số', degree_level = N'Cử nhân', description = N'Ứng dụng phần mềm kế toán tự động, ERP tài chính và kiểm toán dữ liệu lớn.' WHERE id = '22220000-0000-0000-0000-000000000013';
GO
UPDATE dbo.majors SET name = N'Tiếng Anh Khoa học & Công nghệ', degree_level = N'Cử nhân', description = N'Biên phiên dịch kỹ thuật công nghệ, tiếng Anh học thuật quốc tế.' WHERE id = '22220000-0000-0000-0000-000000000014';
GO
UPDATE dbo.majors SET name = N'Tiếng Nhật Thương mại & CNTT', degree_level = N'Cử nhân', description = N'Tiếng Nhật chuyên ngành phần mềm, chuẩn bị làm việc tại các tập đoàn Nhật Bản (JLPT N2).' WHERE id = '22220000-0000-0000-0000-000000000015';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Cơ khí Chế tạo máy', degree_level = N'Kỹ sư', description = N'Thiết kế máy móc công nghiệp, gia công CNC chính xác và mô phỏng CAD/CAM/CAE.' WHERE id = '22220000-0000-0000-0000-000000000016';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Cơ điện tử (Mechatronics)', degree_level = N'Kỹ sư', description = N'Tích hợp phần mềm điều khiển, cơ khí chính xác và cảm biến công nghiệp.' WHERE id = '22220000-0000-0000-0000-000000000017';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Ô tô & Xe điện Thông minh', degree_level = N'Kỹ sư', description = N'Hệ truyền động điện tử, quản lý năng lượng pin và công nghệ xe tự lái.' WHERE id = '22220000-0000-0000-0000-000000000018';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Xây dựng Dân dụng & Công nghiệp', degree_level = N'Kỹ sư', description = N'Tính toán kết cấu công trình, mô hình thông tin công trình BIM và quản lý thi công.' WHERE id = '22220000-0000-0000-0000-000000000019';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Xây dựng Công trình Giao thông', degree_level = N'Kỹ sư', description = N'Quy hoạch mạng lưới giao thông thông minh, cầu hầm và đường cao tốc hiện đại.' WHERE id = '22220000-0000-0000-0000-000000000020';
GO
UPDATE dbo.majors SET name = N'Công nghệ Kỹ thuật Hóa học', degree_level = N'Kỹ sư', description = N'Hóa dược, tổng hợp polymer và kỹ thuật hóa dầu bền vững.' WHERE id = '22220000-0000-0000-0000-000000000021';
GO
UPDATE dbo.majors SET name = N'Khoa học & Kỹ thuật Vật liệu Mới', degree_level = N'Kỹ sư', description = N'Vật liệu nano, màng bán dẫn và vật liệu composite siêu nhẹ.' WHERE id = '22220000-0000-0000-0000-000000000022';
GO
UPDATE dbo.majors SET name = N'Công nghệ Sinh học Ứng dụng', degree_level = N'Cử nhân', description = N'Di truyền phân tử, vắc-xin sinh học và công nghệ vi sinh xử lý môi trường.' WHERE id = '22220000-0000-0000-0000-000000000023';
GO
UPDATE dbo.majors SET name = N'Kỹ thuật Quản lý Môi trường', degree_level = N'Kỹ sư', description = N'Kinh tế tuần hoàn, đánh giá tác động môi trường và xử lý nước thải khí thải công nghiệp.' WHERE id = '22220000-0000-0000-0000-000000000024';
GO
UPDATE dbo.majors SET name = N'Luật Kinh tế & Thương mại Quốc tế', degree_level = N'Cử nhân', description = N'Hợp đồng thương mại điện tử, tranh chấp xuyên biên giới và công pháp quốc tế.' WHERE id = '22220000-0000-0000-0000-000000000025';
GO
UPDATE dbo.majors SET name = N'Luật Công nghệ số & Sở hữu Trí tuệ', degree_level = N'Cử nhân', description = N'Bảo vệ dữ liệu cá nhân (GDPR), bản quyền phần mềm và pháp lý trí tuệ nhân tạo.' WHERE id = '22220000-0000-0000-0000-000000000026';
GO
UPDATE dbo.majors SET name = N'Thiết kế Đồ họa & Trải nghiệm UI/UX', degree_level = N'Cử nhân', description = N'Thiết kế giao diện ứng dụng web/mobile, hệ thống nhận diện thương hiệu số.' WHERE id = '22220000-0000-0000-0000-000000000027';
GO
UPDATE dbo.majors SET name = N'Truyền thông Đa phương tiện & Kỹ xảo 3D', degree_level = N'Cử nhân', description = N'Sản xuất video số, kỹ xảo điện ảnh VFX và phát triển mô hình trò chơi điện tử.' WHERE id = '22220000-0000-0000-0000-000000000028';
GO
UPDATE dbo.majors SET name = N'Toán Tin Ứng dụng & Khoa học Định phí', degree_level = N'Cử nhân', description = N'Mô hình hóa tài chính, bảo hiểm (Actuarial Science) và tối ưu hóa giải thuật.' WHERE id = '22220000-0000-0000-0000-000000000029';
GO
UPDATE dbo.majors SET name = N'Dược học Lâm sàng & Công nghệ Dược', degree_level = N'Dược sĩ', description = N'Bào chế dược phẩm, kiểm nghiệm thuốc và quản trị nhà thuốc bệnh viện.' WHERE id = '22220000-0000-0000-0000-000000000030';
GO
UPDATE dbo.users SET full_name = N'Hệ thống Quản trị viên' WHERE id = '11111111-1111-1111-1111-111111111111';
GO
UPDATE dbo.users SET full_name = N'Ban Quản trị Đào tạo & Khảo thí' WHERE id = '11111111-1111-1111-1111-000000000002';
GO
UPDATE dbo.users SET full_name = N'Kỹ sư Giám sát An ninh Mạng' WHERE id = '11111111-1111-1111-1111-000000000003';
GO
UPDATE dbo.users SET full_name = N'Trung tâm Hạ tầng & Điện toán Đám mây' WHERE id = '11111111-1111-1111-1111-000000000004';
GO
UPDATE dbo.users SET full_name = N'TS. Nguyễn Văn A' WHERE id = '22222222-2222-2222-2222-222222222222';
GO
UPDATE dbo.users SET full_name = N'PGS. TS. Trần Đức Toàn' WHERE id = '22222222-2222-2222-2222-000000000002';
GO
UPDATE dbo.users SET full_name = N'TS. Lê Thị Mai' WHERE id = '22222222-2222-2222-2222-000000000003';
GO
UPDATE dbo.users SET full_name = N'TS. Vũ Đình Tuấn' WHERE id = '22222222-2222-2222-2222-000000000004';
GO
UPDATE dbo.users SET full_name = N'ThS. Nguyễn Quỳnh Chi' WHERE id = '22222222-2222-2222-2222-000000000005';
GO
UPDATE dbo.users SET full_name = N'ThS. David Harrison' WHERE id = '22222222-2222-2222-2222-000000000006';
GO
UPDATE dbo.users SET full_name = N'PGS. TS. Hoàng Quốc Việt' WHERE id = '22222222-2222-2222-2222-000000000007';
GO
UPDATE dbo.users SET full_name = N'TS. Đặng Thanh Tùng' WHERE id = '22222222-2222-2222-2222-000000000008';
GO
UPDATE dbo.users SET full_name = N'PGS. TS. Bùi Thị Mai Hương' WHERE id = '22222222-2222-2222-2222-000000000009';
GO
UPDATE dbo.users SET full_name = N'TS. Trịnh Thúy Hà' WHERE id = '22222222-2222-2222-2222-000000000010';
GO
UPDATE dbo.users SET full_name = N'TS. Phan Văn Khiêm' WHERE id = '22222222-2222-2222-2222-000000000011';
GO
UPDATE dbo.users SET full_name = N'ThS. Trần Quốc Huy' WHERE id = '22222222-2222-2222-2222-000000000012';
GO
UPDATE dbo.users SET full_name = N'Trần Thị B' WHERE id = '33333333-3333-3333-3333-333333333333';
GO
UPDATE dbo.users SET full_name = N'Nguyễn Văn Minh' WHERE id = '33333333-3333-3333-3333-000000000002';
GO
UPDATE dbo.users SET full_name = N'Lê Thị Hồng Nhung' WHERE id = '33333333-3333-3333-3333-000000000003';
GO
UPDATE dbo.users SET full_name = N'Phạm Quốc Bảo' WHERE id = '33333333-3333-3333-3333-000000000004';
GO
UPDATE dbo.users SET full_name = N'Vũ Hoàng Long' WHERE id = '33333333-3333-3333-3333-000000000005';
GO
UPDATE dbo.users SET full_name = N'Đỗ Thu Hà' WHERE id = '33333333-3333-3333-3333-000000000006';
GO
UPDATE dbo.users SET full_name = N'Nguyễn Gia Huy' WHERE id = '33333333-3333-3333-3333-000000000007';
GO
UPDATE dbo.users SET full_name = N'Hoàng Kim Ngân' WHERE id = '33333333-3333-3333-3333-000000000008';
GO
UPDATE dbo.users SET full_name = N'Bùi Anh Tuấn' WHERE id = '33333333-3333-3333-3333-000000000009';
GO
UPDATE dbo.users SET full_name = N'Đinh Trọng Đức' WHERE id = '33333333-3333-3333-3333-000000000010';
GO
UPDATE dbo.users SET full_name = N'Phan Mỹ Duyên' WHERE id = '33333333-3333-3333-3333-000000000011';
GO
UPDATE dbo.users SET full_name = N'Trương Quang Khải' WHERE id = '33333333-3333-3333-3333-000000000012';
GO
UPDATE dbo.users SET full_name = N'Võ Ngọc Ánh' WHERE id = '33333333-3333-3333-3333-000000000013';
GO
UPDATE dbo.users SET full_name = N'Ngô Kiến Văn' WHERE id = '33333333-3333-3333-3333-000000000014';
GO
UPDATE dbo.users SET full_name = N'Mai Diệu Linh' WHERE id = '33333333-3333-3333-3333-000000000015';
GO
UPDATE dbo.users SET full_name = N'Lâm Gia Bảo' WHERE id = '33333333-3333-3333-3333-000000000016';
GO
UPDATE dbo.users SET full_name = N'Dương Thùy Trang' WHERE id = '33333333-3333-3333-3333-000000000017';
GO
UPDATE dbo.users SET full_name = N'Đoàn Minh Trí' WHERE id = '33333333-3333-3333-3333-000000000018';
GO
UPDATE dbo.users SET full_name = N'Tạ Hữu Nam' WHERE id = '33333333-3333-3333-3333-000000000019';
GO
UPDATE dbo.users SET full_name = N'Hồ Bích Ngọc' WHERE id = '33333333-3333-3333-3333-000000000020';
GO
UPDATE dbo.users SET full_name = N'Châu Văn Thái' WHERE id = '33333333-3333-3333-3333-000000000021';
GO
UPDATE dbo.users SET full_name = N'Lương Thanh Tùng' WHERE id = '33333333-3333-3333-3333-000000000022';
GO
UPDATE dbo.users SET full_name = N'Huỳnh Khánh Linh' WHERE id = '33333333-3333-3333-3333-000000000023';
GO
UPDATE dbo.users SET full_name = N'Phùng Mạnh Thắng' WHERE id = '33333333-3333-3333-3333-000000000024';
GO
UPDATE dbo.users SET full_name = N'Nguyễn Diệu Hoa' WHERE id = '33333333-3333-3333-3333-000000000025';
GO
UPDATE dbo.users SET full_name = N'Trịnh Quốc Cường' WHERE id = '33333333-3333-3333-3333-000000000026';
GO
UPDATE dbo.users SET full_name = N'Hoàng Nhật Minh' WHERE id = '33333333-3333-3333-3333-000000000027';
GO
UPDATE dbo.users SET full_name = N'Lê Minh Quân' WHERE id = '33333333-3333-3333-3333-000000000028';
GO
UPDATE dbo.users SET full_name = N'Phạm Phương Anh' WHERE id = '33333333-3333-3333-3333-000000000029';
GO
UPDATE dbo.users SET full_name = N'Trần Đức Huy' WHERE id = '33333333-3333-3333-3333-000000000030';
GO
UPDATE dbo.users SET full_name = N'Ngô Thanh Hằng' WHERE id = '33333333-3333-3333-3333-000000000031';
GO
UPDATE dbo.users SET full_name = N'Đặng Quốc Việt' WHERE id = '33333333-3333-3333-3333-000000000032';
GO
UPDATE dbo.users SET full_name = N'Bùi Khánh Huyền' WHERE id = '33333333-3333-3333-3333-000000000033';
GO
UPDATE dbo.users SET full_name = N'Vũ Đình Khang' WHERE id = '33333333-3333-3333-3333-000000000034';
GO
UPDATE dbo.users SET full_name = N'Hà Thị Thảo' WHERE id = '33333333-3333-3333-3333-000000000035';
GO
UPDATE dbo.users SET full_name = N'Lý Văn Hùng' WHERE id = '33333333-3333-3333-3333-000000000036';
GO
UPDATE dbo.users SET full_name = N'Mai Bảo Trâm' WHERE id = '33333333-3333-3333-3333-000000000037';
GO
UPDATE dbo.users SET full_name = N'Đỗ Quốc Anh' WHERE id = '33333333-3333-3333-3333-000000000038';
GO
UPDATE dbo.users SET full_name = N'Nguyễn Thảo My' WHERE id = '33333333-3333-3333-3333-000000000039';
GO
UPDATE dbo.users SET full_name = N'Trịnh Hải Yến' WHERE id = '33333333-3333-3333-3333-000000000040';
GO
UPDATE dbo.users SET full_name = N'Phan Hoàng Long' WHERE id = '33333333-3333-3333-3333-000000000041';
GO
UPDATE dbo.users SET full_name = N'Châu Bảo Ngọc' WHERE id = '33333333-3333-3333-3333-000000000042';
GO
UPDATE dbo.users SET full_name = N'Đào Trọng Tín' WHERE id = '33333333-3333-3333-3333-000000000043';
GO
UPDATE dbo.users SET full_name = N'Cao Mỹ Uyên' WHERE id = '33333333-3333-3333-3333-000000000044';
GO
UPDATE dbo.users SET full_name = N'Lê Tuấn Kiệt' WHERE id = '33333333-3333-3333-3333-000000000045';
GO
UPDATE dbo.users SET full_name = N'Võ Diễm Quỳnh' WHERE id = '33333333-3333-3333-3333-000000000046';
GO
UPDATE dbo.users SET full_name = N'Hồ Quang Hiếu' WHERE id = '33333333-3333-3333-3333-000000000047';
GO
UPDATE dbo.users SET full_name = N'Dương Ngọc Ánh' WHERE id = '33333333-3333-3333-3333-000000000048';
GO
UPDATE dbo.users SET full_name = N'Lương Gia Huy' WHERE id = '33333333-3333-3333-3333-000000000049';
GO
UPDATE dbo.users SET full_name = N'Tạ Phương Linh' WHERE id = '33333333-3333-3333-3333-000000000050';
GO
UPDATE dbo.users SET full_name = N'Vương Đình Bảo' WHERE id = '33333333-3333-3333-3333-000000000051';
GO
UPDATE dbo.users SET full_name = N'Nghiêm Thúy Vi' WHERE id = '33333333-3333-3333-3333-000000000052';
GO
UPDATE dbo.users SET full_name = N'Lưu Tuấn Thành' WHERE id = '33333333-3333-3333-3333-000000000053';
GO
UPDATE dbo.users SET full_name = N'Tăng Khải Hoàn' WHERE id = '33333333-3333-3333-3333-000000000054';
GO
UPDATE dbo.users SET full_name = N'Kim Ngọc Mai' WHERE id = '33333333-3333-3333-3333-000000000055';
GO
UPDATE dbo.users SET full_name = N'Nguyễn Trọng Đại' WHERE id = '33333333-3333-3333-3333-000000000056';
GO
UPDATE dbo.users SET full_name = N'Trần Kim Chi' WHERE id = '33333333-3333-3333-3333-000000000057';
GO
UPDATE dbo.users SET full_name = N'Lê Minh Triết' WHERE id = '33333333-3333-3333-3333-000000000058';
GO
UPDATE dbo.users SET full_name = N'Hoàng Yến Nhi' WHERE id = '33333333-3333-3333-3333-000000000059';
GO
UPDATE dbo.users SET full_name = N'Bùi Văn Lâm' WHERE id = '33333333-3333-3333-3333-000000000060';
GO
UPDATE dbo.users SET full_name = N'Em gửi thầy link repo GitHub và file nén mã nguồn dự án app chi tiêu.' WHERE id = 'eeeb0000-0000-0000-0000-000000000001';
GO
UPDATE dbo.users SET full_name = N'Bài làm nộp sớm, đã tích hợp biểu đồ thống kê chi tiêu.' WHERE id = 'eeeb0000-0000-0000-0000-000000000002';
GO
UPDATE dbo.users SET full_name = N'Đã hoàn thành các chức năng cốt lõi theo đề bài.' WHERE id = 'eeeb0000-0000-0000-0000-000000000003';
GO
UPDATE dbo.users SET full_name = N'Nộp bài lab 2 API đăng ký môn học.' WHERE id = 'eeeb0000-0000-0000-0000-000000000005';
GO
UPDATE dbo.users SET full_name = N'Đã bổ sung Swagger UI và tài liệu API.' WHERE id = 'eeeb0000-0000-0000-0000-000000000006';
GO
UPDATE dbo.users SET full_name = N'Mô hình MobileNetV2 đạt accuracy 94.2% trên tập test.' WHERE id = 'eeeb0000-0000-0000-0000-000000000007';
GO
UPDATE dbo.users SET full_name = N'Mã nguồn Red-Black Tree với giao diện terminal tương tác.' WHERE id = 'eeeb0000-0000-0000-0000-000000000009';
GO
UPDATE dbo.users SET full_name = N'Kịch bản GitHub Actions và Kubernetes manifest files.' WHERE id = 'eeeb0000-0000-0000-0000-000000000011';
GO
UPDATE dbo.users SET full_name = N'Package ROS điều khiển robot UR5 trong môi trường mô phỏng.' WHERE id = 'eeeb0000-0000-0000-0000-000000000013';
GO
UPDATE dbo.users SET full_name = N'File thiết kế Figma và link prototype tương tác app Telehealth.' WHERE id = 'eeeb0000-0000-0000-0000-000000000017';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Phần mềm (Software Engineering)', academic_title = N'Đại học Chính quy' WHERE id = '22220000-0000-0000-0000-000000000001';
GO
UPDATE dbo.teacher_profiles SET department = N'Trí tuệ Nhân tạo & Khoa học Dữ liệu', academic_title = N'Chất lượng cao' WHERE id = '22220000-0000-0000-0000-000000000002';
GO
UPDATE dbo.teacher_profiles SET department = N'Khoa học Máy tính', academic_title = N'Đại học Chính quy' WHERE id = '22220000-0000-0000-0000-000000000003';
GO
UPDATE dbo.teacher_profiles SET department = N'An toàn Thông tin (Cybersecurity)', academic_title = N'Đại học Chính quy' WHERE id = '22220000-0000-0000-0000-000000000004';
GO
UPDATE dbo.teacher_profiles SET department = N'Hệ thống Thông tin Quản lý', academic_title = N'Đại học Chính quy' WHERE id = '22220000-0000-0000-0000-000000000005';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Điện tử - Viễn thông', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000006';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Điều khiển & Tự động hóa', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000007';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Robot & Hệ thống thông minh', academic_title = N'Chất lượng cao' WHERE id = '22220000-0000-0000-0000-000000000008';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Vi mạch & Bán dẫn (Semiconductor)', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000009';
GO
UPDATE dbo.teacher_profiles SET department = N'Quản trị Kinh doanh số', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000010';
GO
UPDATE dbo.teacher_profiles SET department = N'Thương mại Điện tử (E-Commerce)', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000011';
GO
UPDATE dbo.teacher_profiles SET department = N'Công nghệ Tài chính (Fintech)', academic_title = N'Chất lượng cao' WHERE id = '22220000-0000-0000-0000-000000000012';
GO
UPDATE dbo.teacher_profiles SET department = N'Kế toán & Kiểm toán số', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000013';
GO
UPDATE dbo.teacher_profiles SET department = N'Tiếng Anh Khoa học & Công nghệ', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000014';
GO
UPDATE dbo.teacher_profiles SET department = N'Tiếng Nhật Thương mại & CNTT', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000015';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Cơ khí Chế tạo máy', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000016';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Cơ điện tử (Mechatronics)', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000017';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Ô tô & Xe điện Thông minh', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000018';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Xây dựng Dân dụng & Công nghiệp', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000019';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Xây dựng Công trình Giao thông', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000020';
GO
UPDATE dbo.teacher_profiles SET department = N'Công nghệ Kỹ thuật Hóa học', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000021';
GO
UPDATE dbo.teacher_profiles SET department = N'Khoa học & Kỹ thuật Vật liệu Mới', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000022';
GO
UPDATE dbo.teacher_profiles SET department = N'Công nghệ Sinh học Ứng dụng', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000023';
GO
UPDATE dbo.teacher_profiles SET department = N'Kỹ thuật Quản lý Môi trường', academic_title = N'Kỹ sư' WHERE id = '22220000-0000-0000-0000-000000000024';
GO
UPDATE dbo.teacher_profiles SET department = N'Luật Kinh tế & Thương mại Quốc tế', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000025';
GO
UPDATE dbo.teacher_profiles SET department = N'Luật Công nghệ số & Sở hữu Trí tuệ', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000026';
GO
UPDATE dbo.teacher_profiles SET department = N'Thiết kế Đồ họa & Trải nghiệm UI/UX', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000027';
GO
UPDATE dbo.teacher_profiles SET department = N'Truyền thông Đa phương tiện & Kỹ xảo 3D', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000028';
GO
UPDATE dbo.teacher_profiles SET department = N'Toán Tin Ứng dụng & Khoa học Định phí', academic_title = N'Cử nhân' WHERE id = '22220000-0000-0000-0000-000000000029';
GO
UPDATE dbo.teacher_profiles SET department = N'Dược học Lâm sàng & Công nghệ Dược', academic_title = N'Dược sĩ' WHERE id = '22220000-0000-0000-0000-000000000030';
GO
UPDATE dbo.teacher_profiles SET department = N'Bài tập lớn: Ứng dụng Quản lý Chi tiêu Cá nhân đa nền tảng', academic_title = N'Xây dựng ứng dụng hoàn chỉnh với React Native, sử dụng SQLite lưu trữ offline và đồng bộ Firebase.' WHERE id = 'eeea0000-0000-0000-0000-000000000001';
GO
UPDATE dbo.teacher_profiles SET department = N'Đồ án AI: Phân loại Ảnh Chó/Mèo sử dụng Transfer Learning', academic_title = N'Ứng dụng mô hình MobileNetV2 tiền huấn luyện để phân loại ảnh, viết báo cáo phân tích ma trận nhầm lẫn.' WHERE id = 'eeea0000-0000-0000-0000-000000000003';
GO
UPDATE dbo.teacher_profiles SET department = N'Thông báo về việc nộp bài tập lớn học phần INT3306', academic_title = N'Các nhóm chú ý hạn chót nộp bài tập lớn là 23h59 Chủ nhật tuần sau. Nộp đầy đủ mã nguồn kèm tài liệu PDF.' WHERE id = 'ddda0000-0000-0000-0000-000000000001';
GO
UPDATE dbo.teacher_profiles SET department = N'Kế hoạch thi vấn đáp kết thúc môn Web Nâng cao', academic_title = N'Lịch thi vấn đáp demo đồ án sẽ diễn ra tại phòng máy A2-401 vào sáng thứ 6.' WHERE id = 'ddda0000-0000-0000-0000-000000000002';
GO
UPDATE dbo.teacher_profiles SET department = N'Mở phòng máy chủ GPU hỗ trợ huấn luyện mô hình Deep Learning', academic_title = N'Sinh viên cần tài khoản SSH đăng ký qua email lớp trưởng trước thứ 4.' WHERE id = 'ddda0000-0000-0000-0000-000000000003';
GO
UPDATE dbo.teacher_profiles SET department = N'Tài liệu bổ sung ôn tập Cây nhị phân và Đồ thị', academic_title = N'Thầy đã tải lên hệ thống bộ câu hỏi ôn tập thuật toán có lời giải mẫu.' WHERE id = 'ddda0000-0000-0000-0000-000000000004';
GO
UPDATE dbo.teacher_profiles SET department = N'Cảnh báo an ninh: Cập nhật bản vá lỗ hổng OpenSSL mới', academic_title = N'Tất cả các máy ảo trong phòng thực hành phải chạy lệnh cập nhật package bảo mật.' WHERE id = 'ddda0000-0000-0000-0000-000000000005';
GO
UPDATE dbo.teacher_profiles SET department = N'Cấp phát tài khoản Cloud AWS Academy cho sinh viên', academic_title = N'Mỗi sinh viên được cấp 100$ credit để thực hành triển khai cụm k8s.' WHERE id = 'ddda0000-0000-0000-0000-000000000006';
GO
UPDATE dbo.teacher_profiles SET department = N'Lịch mượn kit vi điều khiển STM32 tại phòng thí nghiệm', academic_title = N'Các bạn đến phòng Lab C1-102 nhận kit thực hành vào các buổi chiều.' WHERE id = 'ddda0000-0000-0000-0000-000000000007';
GO
UPDATE dbo.teacher_profiles SET department = N'Thông báo demo cánh tay Robot tuần 10', academic_title = N'Nhóm trưởng chuẩn bị file launch mô phỏng trên Gazebo trước giờ lên lớp.' WHERE id = 'ddda0000-0000-0000-0000-000000000008';
GO
UPDATE dbo.teacher_profiles SET department = N'Tọa đàm Gặp gỡ Quỹ Đầu tư Khởi nghiệp mạo hiểm', academic_title = N'Sự kiện diễn ra tại Hội trường B1 vào 9h sáng thứ 7. Khuyến khích các nhóm tham dự.' WHERE id = 'ddda0000-0000-0000-0000-000000000009';
GO
UPDATE dbo.teacher_profiles SET department = N'Final Speaking Test Schedule & Topic Guidelines', academic_title = N'Speaking exams will be conducted 1-on-1 via Zoom for international accreditation.' WHERE id = 'ddda0000-0000-0000-0000-000000000010';
GO
UPDATE dbo.teacher_profiles SET department = N'Hướng dẫn nộp file mô hình 3D cho máy phay CNC', academic_title = N'Chỉ chấp nhận các định dạng chuẩn .STEP hoặc .IGES để nạp vào máy tính trung tâm.' WHERE id = 'ddda0000-0000-0000-0000-000000000011';
GO
UPDATE dbo.teacher_profiles SET department = N'Buổi duyệt Design System & Góp ý wireframe giao diện', academic_title = N'Các nhóm gửi link Figma trước buổi học để được nhận xét trực tiếp trên từng frame.' WHERE id = 'ddda0000-0000-0000-0000-000000000012';
GO
UPDATE dbo.teacher_profiles SET department = N'Thông báo nộp đồ án Revit BIM công trình nhịp lớn', academic_title = N'Thời hạn nộp bài là thứ 5 tuần tới, nộp kèm bảng thống kê vật tư xuất từ Revit.' WHERE id = 'ddda0000-0000-0000-0000-000000000013';
GO
UPDATE dbo.courses SET title = N'Khoa Công nghệ Thông tin', description = N'PGS. TS. Nguyễn Văn A' WHERE id = '11110000-0000-0000-0000-000000000001';
GO
UPDATE dbo.courses SET title = N'Khoa Điện - Điện tử & Viễn thông', description = N'TS. Lê Quang Huy' WHERE id = '11110000-0000-0000-0000-000000000002';
GO
UPDATE dbo.courses SET title = N'Khoa Kinh tế & Quản trị Kinh doanh', description = N'PGS. TS. Phạm Thu Trang' WHERE id = '11110000-0000-0000-0000-000000000003';
GO
UPDATE dbo.courses SET title = N'Khoa Ngoại ngữ & Hợp tác Quốc tế', description = N'TS. Đỗ Hoàng Nam' WHERE id = '11110000-0000-0000-0000-000000000004';
GO
UPDATE dbo.courses SET title = N'Khoa Cơ khí & Kỹ thuật Chế tạo', description = N'PGS. TS. Hoàng Quốc Việt' WHERE id = '11110000-0000-0000-0000-000000000005';
GO
UPDATE dbo.courses SET title = N'Khoa Kỹ thuật Xây dựng & Giao thông', description = N'TS. Đặng Thanh Tùng' WHERE id = '11110000-0000-0000-0000-000000000006';
GO
UPDATE dbo.courses SET title = N'Khoa Công nghệ Hóa học & Vật liệu', description = N'PGS. TS. Bùi Thị Mai Hương' WHERE id = '11110000-0000-0000-0000-000000000007';
GO
UPDATE dbo.courses SET title = N'Khoa Công nghệ Sinh học & Môi trường', description = N'TS. Trịnh Thúy Hà' WHERE id = '11110000-0000-0000-0000-000000000008';
GO
UPDATE dbo.courses SET title = N'Khoa Luật & Quản trị Công', description = N'TS. Phan Văn Khiêm' WHERE id = '11110000-0000-0000-0000-000000000009';
GO
UPDATE dbo.courses SET title = N'Khoa Y - Dược & Khoa học Sức khỏe', description = N'GS. TS. Vũ Đình Chính' WHERE id = '11110000-0000-0000-0000-000000000010';
GO
UPDATE dbo.courses SET title = N'Khoa Thiết kế Mỹ thuật & Truyền thông số', description = N'ThS. Họa sĩ Trần Quốc Huy' WHERE id = '11110000-0000-0000-0000-000000000011';
GO
UPDATE dbo.courses SET title = N'Khoa Khoa học Cơ bản & Toán Ứng dụng', description = N'PGS. TS. Nghiêm Xuân Toán' WHERE id = '11110000-0000-0000-0000-000000000012';
GO
UPDATE dbo.courses SET title = N'Khoa Công nghệ Thông tin', description = N'Phó Giáo Sư' WHERE id = '22222222-2222-2222-2222-222222222222';
GO
UPDATE dbo.courses SET title = N'Khoa Công nghệ Thông tin', description = N'Phó Giáo Sư' WHERE id = '22222222-2222-2222-2222-000000000002';
GO
UPDATE dbo.courses SET title = N'Khoa Công nghệ Thông tin', description = N'Tiến Sĩ' WHERE id = '22222222-2222-2222-2222-000000000003';
GO
UPDATE dbo.courses SET title = N'Khoa Điện - Điện tử & Viễn thông', description = N'Tiến Sĩ' WHERE id = '22222222-2222-2222-2222-000000000004';
GO
UPDATE dbo.courses SET title = N'Khoa Kinh tế & Quản trị Kinh doanh', description = N'Thạc Sĩ' WHERE id = '22222222-2222-2222-2222-000000000005';
GO
UPDATE dbo.courses SET title = N'Khoa Ngoại ngữ & Hợp tác Quốc tế', description = N'Thạc Sĩ' WHERE id = '22222222-2222-2222-2222-000000000006';
GO
UPDATE dbo.courses SET title = N'Khoa Cơ khí & Kỹ thuật Chế tạo', description = N'Phó Giáo Sư' WHERE id = '22222222-2222-2222-2222-000000000007';
GO
UPDATE dbo.courses SET title = N'Khoa Kỹ thuật Xây dựng & Giao thông', description = N'Tiến Sĩ' WHERE id = '22222222-2222-2222-2222-000000000008';
GO
UPDATE dbo.courses SET title = N'Khoa Công nghệ Hóa học & Vật liệu', description = N'Phó Giáo Sư' WHERE id = '22222222-2222-2222-2222-000000000009';
GO
UPDATE dbo.courses SET title = N'Khoa Công nghệ Sinh học & Môi trường', description = N'Tiến Sĩ' WHERE id = '22222222-2222-2222-2222-000000000010';
GO
UPDATE dbo.courses SET title = N'Khoa Luật & Quản trị Công', description = N'Tiến Sĩ' WHERE id = '22222222-2222-2222-2222-000000000011';
GO
UPDATE dbo.courses SET title = N'Khoa Thiết kế Mỹ thuật & Truyền thông số', description = N'Thạc Sĩ' WHERE id = '22222222-2222-2222-2222-000000000012';
GO
UPDATE dbo.courses SET title = N'20241_Phát triển ứng dụng Mobile đa nền tảng (2+1)_12626W.1', description = N'Khóa học kiến trúc Fullstack Client-Server và Mobile đa nền tảng React Native, Flutter hiện đại.' WHERE id = '44444444-4444-4444-4444-444444444444';
GO
UPDATE dbo.courses SET title = N'Thiết kế & Lập trình Web Nâng cao (React + .NET 8 Web API)', description = N'Xây dựng hệ thống Web theo kiến trúc Clean Architecture, RESTful API và Entity Framework Core.' WHERE id = '44444444-0000-0000-0000-000000000002';
GO
UPDATE dbo.courses SET title = N'Trí tuệ Nhân tạo & Ứng dụng Học máy (Machine Learning)', description = N'Nguyên lý giải thuật Machine Learning, Deep Learning, mạng nơ-ron CNN, RNN và Transformer hiện đại.' WHERE id = '44444444-0000-0000-0000-000000000003';
GO
UPDATE dbo.courses SET title = N'Cấu trúc Dữ liệu & Giải thuật Nâng cao', description = N'Cây nhị phân tìm kiếm, Đồ thị, Quy hoạch động, thuật toán luồng cực đại và cấu trúc dữ liệu tiên tiến.' WHERE id = '44444444-0000-0000-0000-000000000004';
GO
UPDATE dbo.courses SET title = N'An ninh Mạng & Phòng chống Tấn công Xâm nhập', description = N'Kỹ thuật phân tích lỗ hổng bảo mật Web, an toàn giao thức mạng và mô phỏng phòng thủ mạng SOC.' WHERE id = '44444444-0000-0000-0000-000000000005';
GO
UPDATE dbo.courses SET title = N'Điện toán Đám mây & Kiến trúc Microservices (Docker & K8s)', description = N'Ảo hóa container Docker, điều phối Kubernetes, triển khai CI/CD trên nền tảng AWS / Microsoft Azure.' WHERE id = '44444444-0000-0000-0000-000000000006';
GO
UPDATE dbo.courses SET title = N'Mạch Tích hợp & Kỹ thuật Vi xử lý ARM', description = N'Thiết kế mạch số, lập trình vi điều khiển ARM Cortex-M, giao tiếp ngoại vi SPI, I2C, UART.' WHERE id = '44444444-0000-0000-0000-000000000007';
GO
UPDATE dbo.courses SET title = N'Hệ thống Điều khiển Tự động & Robot Công nghiệp', description = N'Lập trình điều khiển cánh tay Robot 6 bậc tự do, tích hợp thị giác máy tính và hệ điều hành ROS.' WHERE id = '44444444-0000-0000-0000-000000000008';
GO
UPDATE dbo.courses SET title = N'Khởi nghiệp Đổi mới Sáng tạo & Kinh doanh Số', description = N'Mô hình kinh doanh số Lean Canvas, tiếp cận thị trường MVP và gọi vốn đầu tư thiên thần.' WHERE id = '44444444-0000-0000-0000-000000000009';
GO
UPDATE dbo.courses SET title = N'Phân tích Tài chính Doanh nghiệp & Công nghệ Fintech', description = N'Quản trị dòng tiền, phân tích bảng cân đối kế toán và định giá công ty trong kỷ nguyên số.' WHERE id = '44444444-0000-0000-0000-000000000010';
GO
UPDATE dbo.courses SET title = N'Tiếng Anh Giao tiếp Khoa học Kỹ thuật Quốc tế', description = N'Kỹ năng thuyết trình hội nghị học thuật, viết bài báo khoa học và đàm phán hợp đồng quốc tế.' WHERE id = '44444444-0000-0000-0000-000000000011';
GO
UPDATE dbo.courses SET title = N'Thiết kế Mô hình 3D & Gia công Cơ khí Chính xác CAD/CAM', description = N'Ứng dụng phần mềm SolidWorks, Mastercam lập trình máy phay tiện CNC 5 trục.' WHERE id = '44444444-0000-0000-0000-000000000012';
GO
UPDATE dbo.courses SET title = N'Mô hình Thông tin Công trình BIM & Kết cấu Thép', description = N'Ứng dụng Autodesk Revit xây dựng bản vẽ 3D và phân tích chịu lực kết cấu công trình nhịp lớn.' WHERE id = '44444444-0000-0000-0000-000000000013';
GO
UPDATE dbo.courses SET title = N'Tư duy Thiết kế UI/UX & Thiết kế Hệ thống Design System', description = N'Nghiên cứu hành vi người dùng (User Research), wireframing, prototyping tương tác trên Figma.' WHERE id = '44444444-0000-0000-0000-000000000014';
GO
UPDATE dbo.courses SET title = N'Trắc nghiệm ôn tập Tuần 1: React Native Core Components', description = N'Đánh giá hiểu biết về JSX, View, Text, StyleSheet và Flexbox trong React Native.' WHERE id = '77770000-0000-0000-0000-000000000001';
GO
UPDATE dbo.courses SET title = N'Bài kiểm tra trắc nghiệm: Kiến trúc Web API & JWT Auth', description = N'Kiểm tra kiến thức REST API methods (GET, POST, PUT, DELETE) và cơ chế Token Bearer.' WHERE id = '77770000-0000-0000-0000-000000000002';
GO
UPDATE dbo.courses SET title = N'Trắc nghiệm Đánh giá: Giải thuật Học máy Cơ bản', description = N'Đánh giá hàm mất mát Loss Function, Gradient Descent và độ đo Accuracy/Precision.' WHERE id = '77770000-0000-0000-0000-000000000003';
GO
UPDATE dbo.courses SET title = N'Trắc nghiệm: Độ phức tạp thuật toán O(logN) và O(N)', description = N'Các câu hỏi phân tích Big-O Notation, Heap Sort, Quick Sort và Dijkstra.' WHERE id = '77770000-0000-0000-0000-000000000004';
GO
UPDATE dbo.courses SET title = N'Trắc nghiệm An ninh Mạng: Top 10 OWASP', description = N'Phòng chống giả mạo CSRF, tràn bộ đệm và mã hóa mật khẩu an toàn.' WHERE id = '77770000-0000-0000-0000-000000000005';
GO
UPDATE dbo.courses SET title = N'Trắc nghiệm: Quản trị Docker & Kubernetes Cluster', description = N'Kiến thức về Pod, Service, Ingress, Persistent Volume và Deployment.' WHERE id = '77770000-0000-0000-0000-000000000006';
GO
UPDATE dbo.courses SET title = N'Trắc nghiệm: Giao thức ngoại vi I2C và SPI', description = N'Đặc tính tốc độ Baudrate, Master-Slave và thanh ghi điều khiển ngắt.' WHERE id = '77770000-0000-0000-0000-000000000007';
GO
UPDATE dbo.courses SET title = N'Trắc nghiệm: Động học Robot công nghiệp', description = N'Tọa độ Euler, Ma trận đồng nhất và không gian làm việc Work Envelope.' WHERE id = '77770000-0000-0000-0000-000000000008';
GO
UPDATE dbo.courses SET title = N'Trắc nghiệm: Khởi nghiệp & Phát triển sản phẩm', description = N'Chi phí CAC, Giá trị vòng đời LTV, Điểm hòa vốn và định giá sản phẩm số.' WHERE id = '77770000-0000-0000-0000-000000000009';
GO
UPDATE dbo.courses SET title = N'Trắc nghiệm: Nguyên lý UX Design & Luật Fitts', description = N'Độ tương phản màu WCAG, phân cấp thị giác và thiết kế giao diện thân thiện di động.' WHERE id = '77770000-0000-0000-0000-000000000010';
GO
UPDATE dbo.courses SET title = N'Quiz: Academic English Vocabulary & Grammar', description = N'Academic vocabulary, technical terms and reading comprehension questions.' WHERE id = '77770000-0000-0000-0000-000000000011';
GO
UPDATE dbo.course_sections SET title = N'Giới thiệu chung & Tài liệu học phần' WHERE id = 'bbbbbbbb-0001-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Week 1: Kiến trúc Mobile & Cài đặt môi trường' WHERE id = 'bbbbbbbb-0001-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Week 2: Quản lý State & Navigation đa tầng' WHERE id = 'bbbbbbbb-0001-0000-0000-000000000003';
GO
UPDATE dbo.course_sections SET title = N'Chương 1: Kiến trúc Web hiện đại & RESTful Standard' WHERE id = 'bbbbbbbb-0002-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Chương 2: Xây dựng Backend với .NET 8 & EF Core' WHERE id = 'bbbbbbbb-0002-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Chương 3: Single Page Application với React 18 & Vite' WHERE id = 'bbbbbbbb-0002-0000-0000-000000000003';
GO
UPDATE dbo.course_sections SET title = N'Tuần 1: Nhập môn Học máy & Xử lý dữ liệu' WHERE id = 'bbbbbbbb-0003-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Tuần 2: Học có giám sát (Regression & Classification)' WHERE id = 'bbbbbbbb-0003-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Tuần 3: Mạng nơ-ron sâu (Deep Neural Networks)' WHERE id = 'bbbbbbbb-0003-0000-0000-000000000003';
GO
UPDATE dbo.course_sections SET title = N'Phần 1: Cây cân bằng AVL và Đỏ-Đen (Red-Black)' WHERE id = 'bbbbbbbb-0004-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Phần 2: Thuật toán đồ thị và Quy hoạch động' WHERE id = 'bbbbbbbb-0004-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Chương 1: Mật mã học cổ điển & Mật mã khóa công khai' WHERE id = 'bbbbbbbb-0005-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Chương 2: Tấn công mạng & Phòng thủ Tường lửa WAF' WHERE id = 'bbbbbbbb-0005-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Chương 1: Containerization với Docker & Docker Compose' WHERE id = 'bbbbbbbb-0006-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Chương 2: Quản trị cụm Kubernetes & Auto-scaling' WHERE id = 'bbbbbbbb-0006-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Tuần 1: Kiến trúc tập lệnh ARM Cortex & Thanh ghi' WHERE id = 'bbbbbbbb-0007-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Tuần 2: Lập trình ngắt ngoại vi & Bộ định thời Timer' WHERE id = 'bbbbbbbb-0007-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Chương 1: Động học thuận và nghịch Robot' WHERE id = 'bbbbbbbb-0008-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Chương 2: Quy hoạch quỹ đạo & Tích hợp ROS' WHERE id = 'bbbbbbbb-0008-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Giai đoạn 1: Khám phá nhu cầu khách hàng & Ý tưởng' WHERE id = 'bbbbbbbb-0009-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Giai đoạn 2: Xây dựng MVP & Kế hoạch tài chính' WHERE id = 'bbbbbbbb-0009-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Phần 1: Báo cáo tài chính doanh nghiệp' WHERE id = 'bbbbbbbb-0010-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Phần 2: Ứng dụng Blockchain & Cổng thanh toán Fintech' WHERE id = 'bbbbbbbb-0010-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Unit 1: Academic Writing & Research Abstracts' WHERE id = 'bbbbbbbb-0011-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Unit 2: International Conference Presentation Skills' WHERE id = 'bbbbbbbb-0011-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Chương 1: Phác thảo mô hình 3D trên SolidWorks' WHERE id = 'bbbbbbbb-0012-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Chương 2: Xuất mã G-Code cho máy phay CNC' WHERE id = 'bbbbbbbb-0012-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Chương 1: Xây dựng mô hình 3D BIM với Revit' WHERE id = 'bbbbbbbb-0013-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Chương 2: Phân tích kết cấu chịu lực nhịp lớn' WHERE id = 'bbbbbbbb-0013-0000-0000-000000000002';
GO
UPDATE dbo.course_sections SET title = N'Chương 1: Nguyên lý thị giác & Bố cục UI hiện đại' WHERE id = 'bbbbbbbb-0014-0000-0000-000000000001';
GO
UPDATE dbo.course_sections SET title = N'Chương 2: Xây dựng Design System chuyên nghiệp trên Figma' WHERE id = 'bbbbbbbb-0014-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Thông tin tổng quan học phần: Phát triển ứng dụng Mobile & Web đa nền tảng', subtitle = NULL, body_markdown = N'# Giới thiệu học phần\nHọc phần trang bị kiến thức nền tảng phát triển ứng dụng di động đa nền tảng hiện đại.' WHERE id = '55555555-0001-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Scorm giới thiệu tổng quan học phần lập trình ứng dụng', subtitle = N'SCORM', body_markdown = NULL WHERE id = '55555555-0001-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Đề cương chi tiết học phần', subtitle = N'PDF', body_markdown = NULL WHERE id = '55555555-0001-0000-0000-000000000003';
GO
UPDATE dbo.lessons SET title = N'Video Bài giảng Week 1: Khởi tạo React Native Expo', subtitle = N'VIDEO', body_markdown = NULL WHERE id = '55555555-0001-0000-0000-000000000004';
GO
UPDATE dbo.lessons SET title = N'Bài tập thực hành Tuần 1: Xây dựng UI Profile người dùng', subtitle = N'THỰC HÀNH', body_markdown = N'Yêu cầu hoàn thành component trang cá nhân người dùng với Flexbox.' WHERE id = '55555555-0001-0000-0000-000000000005';
GO
UPDATE dbo.lessons SET title = N'Trắc nghiệm ôn tập Tuần 1: React Native Core Components', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0001-0000-0000-000000000006';
GO
UPDATE dbo.lessons SET title = N'Bài giảng: RESTful API Principles & Best Practices', subtitle = N'SLIDE', body_markdown = NULL WHERE id = '55555555-0002-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Video: Xây dựng Web API với ASP.NET Core & EF Core', subtitle = N'VIDEO', body_markdown = NULL WHERE id = '55555555-0002-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Bài kiểm tra trắc nghiệm: Kiến trúc Web API & JWT Auth', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0002-0000-0000-000000000003';
GO
UPDATE dbo.lessons SET title = N'Slide: Thuật toán Hồi quy Tuyến tính & Phân loại Logistic', subtitle = N'SLIDE', body_markdown = NULL WHERE id = '55555555-0003-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Thực hành: Huấn luyện mô hình Scikit-Learn trên Colab', subtitle = N'LAB', body_markdown = N'Huấn luyện mô hình dự đoán giá nhà sử dụng tập dữ liệu Boston Housing.' WHERE id = '55555555-0003-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Trắc nghiệm Đánh giá: Giải thuật Học máy Cơ bản', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0003-0000-0000-000000000003';
GO
UPDATE dbo.lessons SET title = N'Tài liệu: Cân bằng xoay cây AVL & Ứng dụng', subtitle = N'TÀI LIỆU', body_markdown = NULL WHERE id = '55555555-0004-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Trắc nghiệm: Độ phức tạp thuật toán O(logN) và O(N)', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0004-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Video: Phân tích lỗ hổng SQL Injection và XSS', subtitle = N'VIDEO', body_markdown = NULL WHERE id = '55555555-0005-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Trắc nghiệm An ninh Mạng: Top 10 OWASP', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0005-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Slide: Dockerfile & Multi-stage Build tối ưu dung lượng', subtitle = N'SLIDE', body_markdown = NULL WHERE id = '55555555-0006-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Trắc nghiệm: Quản trị Docker & Kubernetes Cluster', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0006-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Sơ đồ chân vi điều khiển STM32F4', subtitle = N'TÀI LIỆU', body_markdown = NULL WHERE id = '55555555-0007-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Trắc nghiệm: Giao thức ngoại vi I2C và SPI', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0007-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Tài liệu Ma trận biến đổi Denavit-Hartenberg (D-H)', subtitle = N'SLIDE', body_markdown = NULL WHERE id = '55555555-0008-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Trắc nghiệm: Động học Robot công nghiệp', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0008-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Biểu mẫu Lean Canvas 9 ô chiến lược', subtitle = N'MẪU', body_markdown = NULL WHERE id = '55555555-0009-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Trắc nghiệm: Khởi nghiệp & Phát triển sản phẩm', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0009-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Audio & Script: Presenting Engineering Projects', subtitle = N'AUDIO', body_markdown = NULL WHERE id = '55555555-0011-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Quiz: Academic English Vocabulary & Grammar', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0011-0000-0000-000000000002';
GO
UPDATE dbo.lessons SET title = N'Hướng dẫn thực hành: Tạo Component Variants trên Figma', subtitle = N'VIDEO', body_markdown = NULL WHERE id = '55555555-0014-0000-0000-000000000001';
GO
UPDATE dbo.lessons SET title = N'Trắc nghiệm: Nguyên lý UX Design & Luật Fitts', subtitle = N'TRẮC NGHIỆM', body_markdown = NULL WHERE id = '55555555-0014-0000-0000-000000000002';
GO
UPDATE dbo.quizzes SET title = N'Trắc nghiệm ôn tập Tuần 1: React Native Core Components', description = N'Đánh giá hiểu biết về JSX, View, Text, StyleSheet và Flexbox trong React Native.' WHERE id = '77770000-0000-0000-0000-000000000001';
GO
UPDATE dbo.quizzes SET title = N'Bài kiểm tra trắc nghiệm: Kiến trúc Web API & JWT Auth', description = N'Kiểm tra kiến thức REST API methods (GET, POST, PUT, DELETE) và cơ chế Token Bearer.' WHERE id = '77770000-0000-0000-0000-000000000002';
GO
UPDATE dbo.quizzes SET title = N'Trắc nghiệm Đánh giá: Giải thuật Học máy Cơ bản', description = N'Đánh giá hàm mất mát Loss Function, Gradient Descent và độ đo Accuracy/Precision.' WHERE id = '77770000-0000-0000-0000-000000000003';
GO
UPDATE dbo.quizzes SET title = N'Trắc nghiệm: Độ phức tạp thuật toán O(logN) và O(N)', description = N'Các câu hỏi phân tích Big-O Notation, Heap Sort, Quick Sort và Dijkstra.' WHERE id = '77770000-0000-0000-0000-000000000004';
GO
UPDATE dbo.quizzes SET title = N'Trắc nghiệm An ninh Mạng: Top 10 OWASP', description = N'Phòng chống giả mạo CSRF, tràn bộ đệm và mã hóa mật khẩu an toàn.' WHERE id = '77770000-0000-0000-0000-000000000005';
GO
UPDATE dbo.quizzes SET title = N'Trắc nghiệm: Quản trị Docker & Kubernetes Cluster', description = N'Kiến thức về Pod, Service, Ingress, Persistent Volume và Deployment.' WHERE id = '77770000-0000-0000-0000-000000000006';
GO
UPDATE dbo.quizzes SET title = N'Trắc nghiệm: Giao thức ngoại vi I2C và SPI', description = N'Đặc tính tốc độ Baudrate, Master-Slave và thanh ghi điều khiển ngắt.' WHERE id = '77770000-0000-0000-0000-000000000007';
GO
UPDATE dbo.quizzes SET title = N'Trắc nghiệm: Động học Robot công nghiệp', description = N'Tọa độ Euler, Ma trận đồng nhất và không gian làm việc Work Envelope.' WHERE id = '77770000-0000-0000-0000-000000000008';
GO
UPDATE dbo.quizzes SET title = N'Trắc nghiệm: Khởi nghiệp & Phát triển sản phẩm', description = N'Chi phí CAC, Giá trị vòng đời LTV, Điểm hòa vốn và định giá sản phẩm số.' WHERE id = '77770000-0000-0000-0000-000000000009';
GO
UPDATE dbo.quizzes SET title = N'Trắc nghiệm: Nguyên lý UX Design & Luật Fitts', description = N'Độ tương phản màu WCAG, phân cấp thị giác và thiết kế giao diện thân thiện di động.' WHERE id = '77770000-0000-0000-0000-000000000010';
GO
UPDATE dbo.quizzes SET title = N'Quiz: Academic English Vocabulary & Grammar', description = N'Academic vocabulary, technical terms and reading comprehension questions.' WHERE id = '77770000-0000-0000-0000-000000000011';
GO
UPDATE dbo.quiz_questions SET question_text = N'Trong React Native, component nào tương đương với thẻ <div> trong HTML tiêu chuẩn?', explanation = N'Thẻ View đóng vai trò là container bọc tương tự thẻ div.' WHERE id = '66660000-0000-0000-0000-000000000001';
GO
UPDATE dbo.quiz_questions SET question_text = N'Thuộc tính flexDirection mặc định của Flexbox trong React Native có giá trị là gì?', explanation = N'React Native có flexDirection mặc định là "column", khác với web mặc định là "row".' WHERE id = '66660000-0000-0000-0000-000000000002';
GO
UPDATE dbo.quiz_questions SET question_text = N'Hook nào được dùng để quản lý trạng thái nội bộ của một Functional Component?', explanation = N'useState là hook cơ bản để khởi tạo và cập nhật trạng thái trong React.' WHERE id = '66660000-0000-0000-0000-000000000003';
GO
UPDATE dbo.quiz_questions SET question_text = N'Thư viện nào là tiêu chuẩn công nghiệp được sử dụng phổ biến nhất cho điều hướng trong React Native?', explanation = N'React Navigation là giải pháp routing đa tầng phổ biến nhất.' WHERE id = '66660000-0000-0000-0000-000000000004';
GO
UPDATE dbo.quiz_questions SET question_text = N'Mã trạng thái HTTP nào biểu thị tạo tài nguyên mới thành công trên server?', explanation = N'201 Created là mã chuẩn cho thao tác POST tạo mới thành công.' WHERE id = '66660000-0000-0000-0000-000000000005';
GO
UPDATE dbo.quiz_questions SET question_text = N'Chuỗi JWT gồm mấy phần chính ngăn cách bởi dấu chấm?', explanation = N'Gồm 3 phần: Header, Payload và Signature.' WHERE id = '66660000-0000-0000-0000-000000000006';
GO
UPDATE dbo.quiz_questions SET question_text = N'Giải thuật nào sau đây thuộc nhóm học có giám sát (Supervised Learning)?', explanation = N'Random Forest và Logistic Regression là học có giám sát.' WHERE id = '66660000-0000-0000-0000-000000000007';
GO
UPDATE dbo.quiz_questions SET question_text = N'Hiện tượng mô hình học quá khớp với dữ liệu huấn luyện nhưng dự đoán kém trên dữ liệu mới gọi là gì?', explanation = N'Đó là hiện tượng Overfitting (quá khớp).' WHERE id = '66660000-0000-0000-0000-000000000008';
GO
UPDATE dbo.quiz_questions SET question_text = N'Độ phức tạp trung bình của thao tác tìm kiếm trên cây tìm kiếm nhị phân cân bằng (AVL) là bao nhiêu?', explanation = N'Cây cân bằng luôn đảm bảo chiều cao log(N).' WHERE id = '66660000-0000-0000-0000-000000000009';
GO
UPDATE dbo.quiz_questions SET question_text = N'Thuật toán Dijkstra dùng để tìm đường đi ngắn nhất hoạt động với đồ thị có trọng số như thế nào?', explanation = N'Dijkstra chỉ hoạt động với trọng số không âm (>= 0).' WHERE id = '66660000-0000-0000-0000-000000000010';
GO
UPDATE dbo.quiz_questions SET question_text = N'Biện pháp hiệu quả nhất để phòng chống tấn công SQL Injection là gì?', explanation = N'Sử dụng Parameterized Queries hoặc ORM như Entity Framework Core.' WHERE id = '66660000-0000-0000-0000-000000000011';
GO
UPDATE dbo.quiz_questions SET question_text = N'Tấn công XSS (Cross-Site Scripting) xảy ra khi nào?', explanation = N'Kẻ tấn công chèn mã JavaScript độc hại vào trang web người dùng.' WHERE id = '66660000-0000-0000-0000-000000000012';
GO
UPDATE dbo.quiz_questions SET question_text = N'Đơn vị tính toán nhỏ nhất có thể triển khai và quản trị trong Kubernetes là gì?', explanation = N'Pod là đơn vị nhỏ nhất trong Kubernetes.' WHERE id = '66660000-0000-0000-0000-000000000013';
GO
UPDATE dbo.quiz_questions SET question_text = N'Lệnh nào trong Dockerfile dùng để chỉ định cổng mà container lắng nghe?', explanation = N'EXPOSE dùng để khai báo cổng mạng.' WHERE id = '66660000-0000-0000-0000-000000000014';
GO
UPDATE dbo.quiz_questions SET question_text = N'Giao thức truyền thông nối tiếp SPI sử dụng bao nhiêu dây tín hiệu chính?', explanation = N'Gồm 4 dây: MOSI, MISO, SCK và CS/SS.' WHERE id = '66660000-0000-0000-0000-000000000015';
GO
UPDATE dbo.quiz_questions SET question_text = N'Giao thức I2C sử dụng mấy dây truyền dữ liệu?', explanation = N'Gồm 2 dây: SDA (Data) và SCL (Clock).' WHERE id = '66660000-0000-0000-0000-000000000016';
GO
UPDATE dbo.quiz_questions SET question_text = N'Một cánh tay robot thông thường cần tối thiểu bao nhiêu bậc tự do (DOF) để định vị tự do vị trí và hướng trong không gian 3D?', explanation = N'Cần 6 bậc tự do: 3 tịnh tiến (x,y,z) và 3 quay (roll, pitch, yaw).' WHERE id = '66660000-0000-0000-0000-000000000017';
GO
UPDATE dbo.quiz_questions SET question_text = N'Hệ điều hành robot phổ biến nhất trong nghiên cứu học thuật là gì?', explanation = N'ROS (Robot Operating System) là nền tảng mã nguồn mở phổ biến nhất.' WHERE id = '66660000-0000-0000-0000-000000000018';
GO
UPDATE dbo.quiz_questions SET question_text = N'Độ tương phản màu tối thiểu chuẩn WCAG AA cho văn bản kích thước thông thường là bao nhiêu?', explanation = N'Chuẩn WCAG AA quy định tỷ lệ tương phản tối thiểu là 4.5:1.' WHERE id = '66660000-0000-0000-0000-000000000019';
GO
UPDATE dbo.quiz_questions SET question_text = N'Luật Fitts trong thiết kế giao diện khẳng định điều gì?', explanation = N'Thời gian di chuyển đến mục tiêu phụ thuộc vào khoảng cách và kích thước nút bấm.' WHERE id = '66660000-0000-0000-0000-000000000020';
GO
UPDATE dbo.quiz_questions SET question_text = N'Which section of an academic research paper summarizes the entire study?', explanation = N'Abstract summarizes background, methods, results and conclusion.' WHERE id = '66660000-0000-0000-0000-000000000021';
GO
UPDATE dbo.quiz_questions SET question_text = N'Choose the correct formal synonym for "to look into":', explanation = N'"Investigate" is the academic formal synonym.' WHERE id = '66660000-0000-0000-0000-000000000022';
GO
UPDATE dbo.quiz_questions SET question_text = N'Chỉ số CAC trong khởi nghiệp kinh doanh viết tắt của từ gì?', explanation = N'Customer Acquisition Cost (Chi phí thu hút một khách hàng mới).' WHERE id = '66660000-0000-0000-0000-000000000023';
GO
UPDATE dbo.quiz_questions SET question_text = N'Mô hình Lean Startup khuyến khích xây dựng vòng lặp nào?', explanation = N'Vòng lặp Xây dựng - Đo lường - Học hỏi (Build - Measure - Learn).' WHERE id = '66660000-0000-0000-0000-000000000024';
GO
