<?php

/**
 * Plugin Name: Web Radio Player
 * Plugin URI:        https://github.com/tominik83/btweb-player
 * Description:       Web Player
 * Version:           1.0.1
 * Requires at least: 5.2
 * Requires PHP:      7.2 and ...
 * Author:            Mihajlo Tomic
 * Author URI:        https://bibliotehnika.com/bibliotehnika-plugins/btweb-player/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       btweb-player
 * Domain Path:       /languages
 */

// Ako korisnik pokušava direktno pristupiti, prikaži grešku.
if (!defined('ABSPATH')) {
    wp_die(__('You can\'t access this page', 'UPOZORENJE'));
}

// Glavna klasa za plugin
class BTWEB
{
    public function __construct()
    {
        // Dodaj stilove i skripte
        add_action('wp_enqueue_scripts', array($this, 'load_assets'));

        // Dodaj shortcodove za plejer i websocket info
        add_shortcode('btwp-form_techno', array($this, 'load_shortcode_techno'));
        add_shortcode('btwp-form_prava', array($this, 'load_shortcode_prava'));
        add_shortcode('websocket-info', array($this, 'websocket_shortcode')); // Dodatni shortcode
    }

    public function load_assets()
    {
        // Pribavi verziju plugin-a
        $plugin_path = plugin_dir_path(__FILE__) . basename(__FILE__);
        $version_data = get_file_data($plugin_path, array('Version'));
        $version = $version_data[0];

        // Učitaj stilove i skripte
        wp_enqueue_style('btweb-player-style', plugin_dir_url(__FILE__) . 'dist/btweb-player.css', array(), $version, 'all');
        wp_enqueue_script('btweb-player-script', plugin_dir_url(__FILE__) . 'dist/btweb-player.js', array(), $version, true);
    }

    public function websocket_shortcode()
    {
    ?>                
        <div id="websocket-info-container">
            <h2>WebSocket Info</h2>
            <div id="websocket-info" class="websocket-info-style">
                <p id="ws-station"><strong>Station:</strong> <span></span></p>
                <p id="ws-now-playing"><strong>Now Playing:</strong> <span></span></p>
                <p id="ws-listeners"><strong>Listeners:</strong> <span></span></p>
                <p id="ws-live"><strong>Live:</strong> <span></span></p>
                <p id="ws-online"><strong>Online:</strong> <span></span></p>
            </div>
        </div>
    <?php
    }

    public function load_shortcode_techno()
    {
    ?>
        <div class="station-container" id="techno">
            <h2>Now Playing on</h2>
            <h4>Techno Chronicle</h4>
            <audio id="techno-audio" controls>
                <source src="https://myradio.bibliotehnika.com/listen/techno_chronicle/live" type="audio/mpeg">
            </audio>
            <div id="now-playing-techno" class="now-playing">
                <!-- Information about current song will be dynamically updated by JavaScript -->
            </div>
        </div>
    <?php
    }

    public function load_shortcode_prava()
    {
    ?>
        <div class="station-container" id="prava">
            <h2>Now Playing on</h2>
            <h4>Prava</h4>
            <audio id="prava-audio" controls>
                <source src="https://myradio.bibliotehnika.com/listen/prava/DAP1" type="audio/mpeg">
            </audio>
            <div id="now-playing-prava" class="now-playing">
                <!-- Information about current song will be dynamically updated by JavaScript -->
            </div>
        </div>
    <?php
    }
}

// Inicijalizacija klase
new BTWEB();


class Update
{
    private $api_url = "https://bibliotehnika.com/wp-json/v1/plugins/btweb_player/releases/?repository=btweb_player";
    private $plugin_file;
    private $github_username = 'mikimpek';
    private $github_repo = 'btweb-player';
    // private $token = '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';
    private $token = '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';
    public function __construct()
    {
        $this->plugin_file = plugin_basename(__FILE__);
        add_shortcode('BTWEB_update_info_display', array($this, 'display_plugin_update_info'));
        add_filter('site_transient_update_plugins', array($this, 'check_for_plugin_update'));
    }

    private function fetch_plugin_data()
    {
        $headers = array(
            'User-Agent' => $this->github_repo, // GitHub zahteva User-Agent
            'Authorization' => 'token ' . $this->token, // Autentifikacija pomoću tokena
        );

        $request_args = array(
            'timeout' => 6000, // Timeout za zahtev
            'headers' => $headers, // Prosledi zaglavlja
            'sslverify' => true, // Verifikacija SSL-a, postavite na false samo za testiranje
        );

        $response = wp_safe_remote_get($this->api_url, $request_args);

        if (is_wp_error($response) || $response['response']['code'] != 200) {
            return null;
        }

        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }

    private function update_json_file($new_data)
    {
        if ($new_data) {
            $json_file_path = __DIR__ . "/update/btweb-player-release-data.json";
            $json_dir = dirname($json_file_path);

            if (!file_exists($json_dir)) {
                mkdir($json_dir, 0755, true);
            }

            file_put_contents($json_file_path, json_encode($new_data, JSON_PRETTY_PRINT));
        }
    }

    public function check_for_plugin_update($transient)
    {
        if (!is_object($transient)) {
            $transient = new \stdClass();
        }

        $new_data = $this->fetch_plugin_data();
        $this->update_json_file($new_data);

        if (is_array($new_data)) {
            foreach ($new_data as $release) {
                if (isset($release['tag_name'])) {
                    $plugin_update_data = $this->prepare_plugin_update_data($release);

                    $plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $this->plugin_file);
                    if (version_compare($plugin_data['Version'], $plugin_update_data['tag_name'], '<')) {
                        if (!isset($transient->response)) {
                            $transient->response = array();
                        }
                        $transient->response[$this->plugin_file] = (object) array(
                            'slug' => dirname($this->plugin_file),
                            'new_version' => $plugin_update_data['tag_name'],
                            'url' => 'http://bibliotehnika.test/bibliotehnika-plugins/btweb-player/',
                            'package' => $plugin_update_data['latest_download_link'],
                            'tested' => '6.0',
                            'requires' => '5.0',
                        );
                    }
                }
            }
        }
        return $transient;
    }

    private function prepare_plugin_update_data($release)
    {
        $tag_name = esc_html($release['tag_name']);
        $name = esc_html($release['name']);
        $release_notes = esc_html($release['body']);
        $published = esc_html($release['published_at']);

        // Generišemo URL za preuzimanje .zip fajla sa odgovarajućim tagom
        $latest_download_link = "https://github.com/{$this->github_username}/{$this->github_repo}/archive/refs/tags/{$tag_name}.zip";

        // Proveravamo link i dodajemo autentifikaciju ako je potrebno
        $latest_download_link = $this->get_authenticated_download_link($latest_download_link);

        return compact('tag_name', 'release_notes', 'published', 'latest_download_link');
    }

    private function get_authenticated_download_link($url)
    {
        $headers = array(
            'User-Agent' => $this->github_repo,
            'Authorization' => 'Bearer ' . $this->token, // Autentifikacija pomoću fine-grained tokena
        );

        $request_args = array(
            'timeout' => 6000,
            'headers' => $headers,
            'sslverify' => true,
            'redirection' => 5,
        );

        $response = wp_safe_remote_get($url, $request_args);

        if (is_wp_error($response)) {
            error_log('Error: ' . $response->get_error_message());
            return null;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $content_type = wp_remote_retrieve_header($response, 'content-type');

        if ($response_code != 200) {
            error_log('Unexpected response code: ' . $response_code);
            error_log('Response body: ' . wp_remote_retrieve_body($response)); 
            return null;
        }

        if (strpos($content_type, 'application/zip') === false) {
            error_log('Unexpected content type: ' . $content_type);
            error_log('Response body: ' . wp_remote_retrieve_body($response));
            return null;
        }

        return $url;
    }

    public function display_plugin_update_info()
    {
        $new_data = $this->fetch_plugin_data();
        if (is_array($new_data)) {
            foreach ($new_data as $release) {
                if (isset($release['tag_name'])) {
                    $plugin_update_data = $this->prepare_plugin_update_data($release);

                    $current_version = get_plugin_data(WP_PLUGIN_DIR . '/' . $this->plugin_file)['Version'];
                    if (version_compare($current_version, $plugin_update_data['tag_name'], '<')) {
                        return $this->plugin_update_info($plugin_update_data);
                    }
                }
            }
        }
        return '<p>No updates available.</p>';
    }

    private function plugin_update_info($plugin_update_data)
    {
        $output = '<div id="update-result_info" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">';
        $output .= '<p>Plugin Version: ' . esc_html($plugin_update_data['tag_name']) . '</p>';
        $output .= '<p>Description: ' . esc_html($plugin_update_data['release_notes']) . '</p>';
        $output .= '<p>Published: ' . date('d.m.Y', strtotime($plugin_update_data['published'])) . '</p>';
        $output .= '<a href="' . $plugin_update_data['latest_download_link'] . '" class="download-button" download="BTWE">Download</a>';
        $output .= '</div>';

        return $output;
    }
}

// Inicijalizacija klase
new Update();



