/**
 * 全站JS
 */
 jQuery(document).ready(function($){
 	var Global = {
		/*
		 * 代码高亮的工具栏
		 */
		 codePrettifyToolbar: function(lang) {
		 	var _lang;
		 	switch( lang.toLowerCase() ) {
		 		case 'js':
		 		case 'javascript':
		 		_lang = 'JavaScript';
		 		break;
		 		case 'java':
		 		case 'python':
		 		case 'shell':
		 		_lang = lang.charAt(0).toUpperCase().concat(lang.toLowerCase().slice(1));
		 		break;
		 		case 'bash':
		 		_lang = 'Shell 命令';
		 		break;
		 		case 'c':
		 		_lang = 'C 语言';
		 		break;
		 		case 'html': 
		 		case 'css': 
		 		case 'xml':
		 		case 'cpp':
		 		_lang = lang.toUpperCase();
		 		break;
		 		default:
		 		_lang = lang; 
		 	}

		 	var toolbar = '<div class="code-pretty-toolbar">' +
		 	'<span class="title">' + _lang + '</span>' +
		 	'<a href="javascript:void(0);" title="复制代码" class="tool clipboard"><i class="fa fa-files-o"></i></a>' +
		 	'<a href="javascript:void(0);" title="查看纯文本代码" class="tool view-source"><i class="fa fa-code"></i></a>' +
		 	'<a href="javascript:void(0);" title="返回代码高亮" class="tool back-to-pretty"><i class="fa fa-undo"></i></a>' +
		 	'<span class="msg"></span>' +
		 	'</div>';

		 	return toolbar;
		 },
		/*
		 * 获取代码文本
		 */
		 getPrettifyCode: function($container) {
		 	code = [];

			// 组合代码
			$container.find('li').each(function() {
				code.push( $(this).text() );
			});
			// using \r instead of \r or \r\n makes this work equally well on IE, FF and Webkit
			code = code.join('\r');
			// For Webkit browsers, replace nbsp with a breaking space
			code = code.replace(/\u00a0/g, " ");

			return code;
		},
		/*
		 * 代码高亮工具栏功能
		 */
		 codePrettifyToolbarAction: function() {
		 	/* 复制代码 */
		 	_this = this;
		 	var clipboard = new Clipboard('.clipboard', {
		 		text: function(e) {
		 			$container = $(e).parent().parent();
		 			return _this.getPrettifyCode($container);
		 		}
		 	});
		 	clipboard.on('success', function(e) {
		 		$container = $(e.trigger).parent().parent();
		 		$container.find('.msg').hide().text('已复制.').stop().fadeIn(300).delay(1500).fadeOut(500);
		 	});

		 	clipboard.on('error', function(e) {
		 		$container = $(e.trigger).parent().parent();
		 		$container.find('.msg').hide().text('暂不支持当前浏览器，请手动复制 (ctrl + c)').stop().fadeIn(300).delay(3000).fadeOut(500);
		 		$container.find('.view-source').trigger('click');
		 	});

		 	/* 其他事件 */
		 	$('.code-pretty-toolbar a').on('click', function() {
		 		/* 查看纯文本代码 */
		 		if ( $(this).hasClass('view-source') ) {
		 			$container = $(this).parent().parent();

					// 获取代码文本
					code = _this.getPrettifyCode($container);

					// 填充 textarea
					if ( !$container.find('textarea').length ) {
						$container.append('<textarea class="code-pretty-text">' + code + '</textarea>');
					} else {
						$container.find('textarea').val(code);
					}

					// 调整 textarea 位置
					var $pre = $container.find('pre');
					if ( $pre.hasClass('lang-bash') ) { // bash 固定不变
						var w = $pre.width() - 15;
						var h = $pre.height() + 10;
						var marginLeft = 32;
					} else {
						var liCount = $pre.find('li').length;
						var offset = liCount / 1000;
						var w = $pre.width() - 30 - 5*offset
						var h = $pre.height() + 10;
						var marginLeft = 53 + 5*offset;
					}

					// 显示 textarea
					$container.find('textarea').css({height: h, width: w, 'margin-left': marginLeft})
					.show().select();

					$container.find('.view-source').hide();
					$container.find('.back-to-pretty').css('display', 'inline-block');

				} else if ( $(this).hasClass('back-to-pretty') ) {
					$container.find('.back-to-pretty').hide();
					$container.find('.view-source').css('display', 'inline-block');

					$container.find('textarea').hide();
				}
			});
		 },
		 /* 增加 bash 高亮规则 */
		 codePrettifyAddBash: function() {
		 	/* 不完善的实现 */
		 	PR['registerLangHandler'](
		 		PR['createSimpleLexer'](
		 			[
			         // Whitespace
			         [PR['PR_PLAIN'],       /^[\t\n\r \xA0]+/, null, '\t\n\r \xA0'],
			         // A double or single quoted, possibly multi-line, string.
			         [PR['PR_STRING'],      /^(?:"(?:[^\"\\]|\\.)*"|'(?:[^\'\\]|\\.)*')/, null,
			         '"\'']
			         ],
			         [
			         [PR['PR_COMMENT'], /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, null, '#'],
			         [PR['PR_KEYWORD'], /[^\.\/]?(?:ls|cd|chown|chmod|sudo|su|vi|vim|cat|touch|tar|scp|cp|ssh|useradd|passwd|apt\-get|export|source|echo|mv|mkdir|rm)(\s)+/i, null],
			         // [PR['PR_LITERAL'],
			          // /^([^a-zA-Z0-9](-(\w)*))|\$(\w)*/i],
			         // An identifier
			         [PR['PR_PLAIN'], /^[a-z_][\w-]*/i],
			         // A run of punctuation
			         // [PR['PR_PUNCTUATION'], /^[^\w\t\n\r \xA0\"\'][^\w\t\n\r \xA0+\-\"\']*/]
			         ]),
		 		['bash', 'sh', 'shell']);
		 },
		/*
		 * 代码高亮 Google Code Prettify
		 */
		 codePrettify: function() {
		 	/* 更改 pre 的 class，增加 toolbar */
		 	var _this = this;
		 	$('pre code').each(function() {
		 		var lang = $(this).attr('class');
		 		if (lang) {
		 			var code = $(this).html();
		 			$(this).parent().attr('class', 'prettyprint linenums lang-' + lang).html(code)
		 			.wrap('<div class="code-pretty-container"></div>')
		 			.parent().append( _this.codePrettifyToolbar(lang) );
		 		}
		 	});
		 	this.codePrettifyAddBash();
		 	PR.prettyPrint();
		 	this.codePrettifyToolbarAction();
		 },
		 init: function() {
		 	this.codePrettify();
		 }
		};
		Global.init();
	});
