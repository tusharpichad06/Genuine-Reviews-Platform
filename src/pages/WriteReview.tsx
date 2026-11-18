import Layout from "../components/layout/Layout";
import ReviewForm from "../components/review/ReviewForm";

function WriteReview() {
  return (
    <Layout>
      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-16">
        <ReviewForm />
      </section>
    </Layout>
  );
}

export default WriteReview;