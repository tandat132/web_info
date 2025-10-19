import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactFloat from "@/components/layout/ContactFloat";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Gái Xinh Việt Nam | Tuyển chọn gái đẹp từ khắp 63 tỉnh thành",
  description: "Khám phá bộ sưu tập gái xinh, gái đẹp từ khắp 63 tỉnh thành Việt Nam. Cập nhật hàng ngày với những hình ảnh chất lượng cao.",
  keywords: "gái xinh, gái đẹp, việt nam, ảnh đẹp, hồ sơ",
  openGraph: {
    title: "Gái Xinh Việt Nam",
    description: "Tuyển chọn gái xinh, gái đẹp từ khắp các tỉnh thành Việt Nam",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <SchemaMarkup 
          type="website" 
          data={{
            name: "Gái Xinh Việt Nam",
            description: "Bộ sưu tập gái xinh, gái đẹp từ 63 tỉnh thành Việt Nam"
          }} 
        />
        <SchemaMarkup 
          type="organization" 
          data={{
            phone: "+84123456789",
            facebook: "https://facebook.com/gaixinhvietnam",
            zalo: "https://zalo.me/gaixinhvietnam"
          }} 
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <ContactFloat />
      </body>
    </html>
  );
}
