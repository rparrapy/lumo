/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
asd
`;
var Post = React.createClass({
  statics: { content: content },
  render: function() {
    return (
      <Layout metadata={{"id":"getting-started","title":"Getting Started","layout":"docs","category":"Introduction","permalink":"docs/getting-started.html","next":"using-matchers","source":"GettingStarted.md"}}>
        {content}
      </Layout>
    );
  }
});
module.exports = Post;