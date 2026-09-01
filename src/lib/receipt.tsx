import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Order } from "./types";
import { formatDateTime } from "./format";

// @react-pdf/renderer's built-in fonts (Helvetica etc.) don't include the
// ₹ glyph used elsewhere in the app — it silently falls back to a garbled
// character. "Rs." avoids needing to embed a custom font just for this.
function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString("en-IN")}`;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#2b2b2b",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  tagline: {
    fontSize: 9,
    color: "#666666",
    marginTop: 2,
  },
  receiptTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  metaLine: {
    fontSize: 9,
    color: "#666666",
    textAlign: "right",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  table: {
    marginTop: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2b2b2b",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dddddd",
    paddingVertical: 6,
  },
  colItem: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  tableHeaderText: {
    fontSize: 8,
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalsBlock: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: 200,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalsLabel: {
    color: "#666666",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#2b2b2b",
  },
  grandTotalLabel: {
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
});

export function OrderReceiptDocument({ order }: { order: Order }) {
  return (
    <Document title={`Receipt ${order.id}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>SkinWise</Text>
            <Text style={styles.tagline}>Dermatologist-trusted skincare</Text>
          </View>
          <View>
            <Text style={styles.receiptTitle}>RECEIPT</Text>
            <Text style={styles.metaLine}>Order #{order.razorpayPaymentId}</Text>
            <Text style={styles.metaLine}>{formatDateTime(order.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>Billed to</Text>
            <Text>
              {order.customer.firstName} {order.customer.lastName}
            </Text>
            <Text>{order.customer.email}</Text>
            <Text>{order.customer.phone}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>Shipping address</Text>
            <Text>{order.customer.address}</Text>
            <Text>
              {order.customer.city}, {order.customer.state} {order.customer.pincode}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colItem, styles.tableHeaderText]}>Item</Text>
              <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
              <Text style={[styles.colPrice, styles.tableHeaderText]}>Price</Text>
              <Text style={[styles.colTotal, styles.tableHeaderText]}>Total</Text>
            </View>
            {order.items.map((item) => (
              <View key={item.slug} style={styles.tableRow}>
                <Text style={styles.colItem}>
                  {item.brand} {item.name}
                </Text>
                <Text style={styles.colQty}>{item.qty}</Text>
                <Text style={styles.colPrice}>{formatPrice(item.price)}</Text>
                <Text style={styles.colTotal}>{formatPrice(item.price * item.qty)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text>{formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Shipping</Text>
              <Text>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(order.total)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Payment ID: {order.razorpayPaymentId}  |  Razorpay order: {order.razorpayOrderId}
        </Text>
      </Page>
    </Document>
  );
}
