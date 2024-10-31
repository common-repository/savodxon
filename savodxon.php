<?php
/**
 * Plugin Name: Savodxon
 * Plugin URI: https://savodxon.uz
 * Version: 1.0
 * Author: Javlon Juraev
 * Author URI: https://www.facebook.com/jjavlon
 * Description: TinyMCE tahrir oynasi uchun savodxonni tekshirish plagini
 * License: GPL2
 */

class Savodxon_Class {

    function __construct() {
		if ( is_admin() ) {
			add_action( 'init', array( &$this, 'setup_savodxon_plugin' ) );
		}
    }

	function setup_savodxon_plugin() {

		if ( ! current_user_can( 'edit_posts' ) && ! current_user_can( 'edit_pages' ) ) {
			return;
		}

		if ( get_user_option( 'rich_editing' ) !== 'true' ) {
			return;
		}
		
		add_filter( 'mce_external_plugins', array( &$this, 'add_tinymce_savodxon_plugin' ) );
		add_filter( 'mce_buttons', array( &$this, 'add_tinymce_savodxon_toolbar_button' ) );
		//wp_enqueue_style( 'savodxon_style', plugin_dir_url( __FILE__ ) . 'savodxon.css','1.1','all');
		add_editor_style( plugin_dir_url( __FILE__ ) . 'savodxon.css' );

	}
	
	function add_tinymce_savodxon_plugin( $plugin_array ) {

		$plugin_array['savodxon_class'] = plugin_dir_url( __FILE__ ) . 'savodxon.js';
		return $plugin_array;

	}
	
	function add_tinymce_savodxon_toolbar_button( $buttons ) {

		array_push( $buttons, 'savodxon_check_class' );
		array_push( $buttons, 'savodxon_clear_class' );
		return $buttons;

	}

}

$savodxon_class = new Savodxon_Class;